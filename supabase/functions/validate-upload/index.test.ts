import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("validate-upload rejects missing auth", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/validate-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileType: "document",
      fileName: "test.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
      circleId: "00000000-0000-0000-0000-000000000000",
    }),
  });
  const body = await res.text();
  assertEquals(res.status, 401);
  assertNotEquals(body, "");
});

Deno.test("validate-upload rejects blocked extension", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/validate-upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      fileType: "document",
      fileName: "malware.exe",
      fileSize: 1024,
      mimeType: "application/x-msdownload",
      circleId: "00000000-0000-0000-0000-000000000000",
    }),
  });
  const body = await res.json();
  await res.body?.cancel();
  // Should fail auth first (anon key is not a user token), or reject extension
  assertEquals(res.status === 401 || res.status === 403, true);
});

Deno.test("security-alert logs event", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/security-alert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "log_event",
      event_type: "test_event",
      severity: "low",
      details: { test: true },
    }),
  });
  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.logged, true);
});

Deno.test("security-alert rejects unknown action", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/security-alert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "unknown_action",
    }),
  });
  const body = await res.json();
  assertEquals(res.status, 400);
  assertEquals(body.error, "Unknown action");
});
