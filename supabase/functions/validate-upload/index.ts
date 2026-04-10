import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Whitelist stricte de formats autorisés avec magic bytes
const ALLOWED_FORMATS: Record<string, { mimes: string[]; extensions: string[]; magicBytes?: number[][] }> = {
  photo: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    extensions: ["jpg", "jpeg", "png", "webp", "gif"],
    magicBytes: [
      [0xFF, 0xD8, 0xFF],           // JPEG
      [0x89, 0x50, 0x4E, 0x47],     // PNG
      [0x52, 0x49, 0x46, 0x46],     // WEBP (RIFF)
      [0x47, 0x49, 0x46],           // GIF
    ],
  },
  video: {
    mimes: ["video/mp4", "video/webm", "video/quicktime"],
    extensions: ["mp4", "webm", "mov"],
  },
  audio: {
    mimes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
    extensions: ["mp3", "wav", "ogg", "m4a"],
  },
  document: {
    mimes: [
      "application/pdf",
      "image/jpeg", "image/png", "image/webp",
    ],
    extensions: ["pdf", "jpg", "jpeg", "png", "webp"],
    magicBytes: [
      [0x25, 0x50, 0x44, 0x46],     // PDF (%PDF)
      [0xFF, 0xD8, 0xFF],           // JPEG
      [0x89, 0x50, 0x4E, 0x47],     // PNG
      [0x52, 0x49, 0x46, 0x46],     // WEBP
    ],
  },
};

// Formats explicitement bloqués (exécutables, scripts)
const BLOCKED_EXTENSIONS = [
  "exe", "bat", "cmd", "com", "msi", "scr", "pif",
  "js", "vbs", "wsf", "ps1", "sh", "bash",
  "php", "asp", "aspx", "jsp", "cgi",
  "html", "htm", "svg", "xml",
  "dll", "sys", "drv",
];

// Limites par plan
const LIMITS = {
  free: {
    maxFileSizeMB: 10,
    monthlyPhotos: 50,
    monthlyVideos: 5,
    monthlyDocuments: 20,
    totalMonthlyBytesMB: 500,
  },
  premium: {
    maxFileSizeMB: 50,
    monthlyPhotos: 500,
    monthlyVideos: 50,
    monthlyDocuments: 200,
    totalMonthlyBytesMB: 5000,
  },
};

function jsonResp(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResp({ error: "Missing auth" }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) return jsonResp({ error: "Invalid auth" }, 401);

    const body = await req.json();
    const { fileType, fileName, fileSize, mimeType, circleId, magicBytesHex } = body;

    // 1. Validate required fields
    if (!fileType || !fileName || !fileSize || !mimeType || !circleId) {
      return jsonResp({ error: "Missing required fields" }, 400);
    }

    // 2. Check blocked extensions
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      await logSecurityEvent(supabase, "upload_blocked_extension", user.id, {
        fileName, ext, circleId,
      });
      return jsonResp({ error: "Format de fichier interdit", code: "BLOCKED_FORMAT" }, 403);
    }

    // 3. Validate format against whitelist
    const formatConfig = ALLOWED_FORMATS[fileType];
    if (!formatConfig) {
      return jsonResp({ error: "Type de fichier inconnu", code: "UNKNOWN_TYPE" }, 400);
    }

    if (!formatConfig.mimes.includes(mimeType)) {
      await logSecurityEvent(supabase, "upload_invalid_mime", user.id, {
        fileName, mimeType, fileType, circleId,
      });
      return jsonResp({ error: "Type MIME non autorisé", code: "INVALID_MIME" }, 400);
    }

    if (!formatConfig.extensions.includes(ext)) {
      return jsonResp({ error: "Extension non autorisée", code: "INVALID_EXTENSION" }, 400);
    }

    // 4. Validate magic bytes if provided
    if (magicBytesHex && formatConfig.magicBytes) {
      const headerBytes = hexToBytes(magicBytesHex);
      const matchesMagic = formatConfig.magicBytes.some((magic) =>
        magic.every((b, i) => headerBytes[i] === b)
      );
      if (!matchesMagic) {
        await logSecurityEvent(supabase, "upload_magic_bytes_mismatch", user.id, {
          fileName, mimeType, magicBytesHex: magicBytesHex.substring(0, 20), circleId,
        });
        return jsonResp({ error: "Contenu du fichier incompatible avec le type déclaré", code: "MAGIC_MISMATCH" }, 400);
      }
    }

    // 5. Check file size
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .single();
    const plan = sub?.plan === "premium" ? "premium" : "free";
    const limits = LIMITS[plan];

    if (fileSize > limits.maxFileSizeMB * 1024 * 1024) {
      return jsonResp({
        error: `Fichier trop volumineux (max ${limits.maxFileSizeMB} Mo)`,
        code: "FILE_TOO_LARGE",
      }, 400);
    }

    // 6. Check monthly quotas
    const monthKey = new Date().toISOString().substring(0, 7);
    const { data: quota } = await supabase
      .from("upload_quotas")
      .select("*")
      .eq("circle_id", circleId)
      .eq("month_key", monthKey)
      .single();

    const current = quota || {
      photos_count: 0, videos_count: 0, documents_count: 0, total_bytes: 0,
    };

    if (fileType === "photo" && current.photos_count >= limits.monthlyPhotos) {
      return jsonResp({ error: "Quota mensuel de photos atteint", code: "QUOTA_PHOTOS" }, 429);
    }
    if (fileType === "video" && current.videos_count >= limits.monthlyVideos) {
      return jsonResp({ error: "Quota mensuel de vidéos atteint", code: "QUOTA_VIDEOS" }, 429);
    }
    if (fileType === "document" && current.documents_count >= limits.monthlyDocuments) {
      return jsonResp({ error: "Quota mensuel de documents atteint", code: "QUOTA_DOCUMENTS" }, 429);
    }
    if ((current.total_bytes + fileSize) > limits.totalMonthlyBytesMB * 1024 * 1024) {
      return jsonResp({ error: "Quota mensuel de stockage atteint", code: "QUOTA_STORAGE" }, 429);
    }

    // 7. Update quotas
    const countField = fileType === "photo" ? "photos_count"
      : fileType === "video" ? "videos_count"
      : "documents_count";
    const bytesField = fileType === "photo" ? "photos_bytes"
      : fileType === "video" ? "videos_bytes"
      : "documents_bytes";

    if (quota) {
      await supabase.from("upload_quotas").update({
        [countField]: (quota as Record<string, number>)[countField] + 1,
        [bytesField]: (quota as Record<string, number>)[bytesField] + fileSize,
        total_bytes: current.total_bytes + fileSize,
        updated_at: new Date().toISOString(),
      }).eq("id", quota.id);
    } else {
      await supabase.from("upload_quotas").insert({
        circle_id: circleId,
        month_key: monthKey,
        [countField]: 1,
        [bytesField]: fileSize,
        total_bytes: fileSize,
      });
    }

    return jsonResp({ allowed: true, plan, limits });
  } catch (err) {
    console.error("validate-upload error:", err);
    return jsonResp({ error: "Internal error" }, 500);
  }
});

function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return bytes;
}

async function logSecurityEvent(
  supabase: ReturnType<typeof createClient>,
  eventType: string,
  userId: string,
  details: Record<string, unknown>
) {
  await supabase.from("security_events").insert({
    event_type: eventType,
    severity: "high",
    user_id: userId,
    details,
  });
}
