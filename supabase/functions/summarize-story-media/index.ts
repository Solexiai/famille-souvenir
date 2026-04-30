// Edge function: summarize-story-media
// Receives a base64 image OR a story text content
// Returns a short, warm description / summary in the requested language (default: French).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummarizeRequest {
  // Either provide imageBase64 (for photo description) or text (for story summary)
  imageBase64?: string;
  mimeType?: string;
  text?: string;
  kind: 'photo' | 'video' | 'story';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as SummarizeRequest;
    const { kind } = body;

    let messages: any[];
    if (kind === 'photo' || kind === 'video') {
      if (!body.imageBase64) {
        return new Response(JSON.stringify({ error: 'imageBase64 required for photo/video' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const dataUrl = body.imageBase64.startsWith('data:')
        ? body.imageBase64
        : `data:${body.mimeType || 'image/jpeg'};base64,${body.imageBase64}`;

      const what = kind === 'video' ? 'cette vignette de vidéo' : 'cette photo';
      messages = [
        {
          role: 'system',
          content: `Tu décris ${what} de famille en 2 ou 3 phrases chaleureuses, en français. Décris ce qu'on voit (personnes, lieu, époque approximative si visible, ambiance) sans inventer de noms ni de dates précises. Sois respectueux et bienveillant.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Décris cette image pour un album de souvenirs familial.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ];
    } else if (kind === 'story') {
      if (!body.text) {
        return new Response(JSON.stringify({ error: 'text required for story' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      messages = [
        {
          role: 'system',
          content: 'Tu résumes un récit familial en 2 à 3 phrases, dans la langue d\'origine du texte. Conserve l\'émotion et les éléments clés. Ne juge pas, ne réécris pas le style — synthétise simplement.',
        },
        { role: 'user', content: body.text.slice(0, 8000) },
      ];
    } else {
      return new Response(JSON.stringify({ error: 'invalid kind' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Trop de requêtes IA.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Crédits IA épuisés.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errText);
      return new Response(JSON.stringify({ error: 'Erreur IA.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const summary = aiData?.choices?.[0]?.message?.content?.trim() || '';
    return new Response(JSON.stringify({ summary }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('summarize-story-media error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erreur inconnue' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
