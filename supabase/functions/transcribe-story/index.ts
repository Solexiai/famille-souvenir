// Edge function: transcribe-story
// Receives base64 audio of someone telling a family story.
// Returns a structured object: { title, content, summary } in the original language.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscribeRequest {
  audioBase64: string;
  mimeType?: string;
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

    const { audioBase64, mimeType = 'audio/webm' } = (await req.json()) as TranscribeRequest;
    if (!audioBase64) {
      return new Response(JSON.stringify({ error: 'audioBase64 is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dataUrl = audioBase64.startsWith('data:')
      ? audioBase64
      : `data:${mimeType};base64,${audioBase64}`;

    const systemPrompt = `Tu es un expert qui transcrit et structure des récits familiaux dictés à voix haute (souvent par des aînés racontant une tranche de vie, une anecdote, un souvenir).

Ton travail :
1. DÉTECTE la langue parlée et garde le texte dans cette langue d'origine (authenticité familiale).
2. PROPOSE un titre court et évocateur (max 80 caractères).
3. RESTITUE fidèlement le récit complet dans le champ "content" — garde les mots du conteur, les expressions familières, les émotions. N'invente rien.
4. RÉSUME en 2 à 3 phrases dans le champ "summary".

Appelle la fonction extract_story.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Voici l\'audio. Transcris fidèlement et structure.' },
              { type: 'input_audio', input_audio: { data: dataUrl, format: mimeType.includes('webm') ? 'webm' : 'mp3' } },
            ],
          },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'extract_story',
            description: 'Retourne le récit transcrit et structuré.',
            parameters: {
              type: 'object',
              properties: {
                detected_language: { type: 'string' },
                title: { type: 'string' },
                content: { type: 'string', description: 'Texte intégral du récit, mot pour mot.' },
                summary: { type: 'string', description: 'Résumé court en 2-3 phrases.' },
              },
              required: ['detected_language', 'title', 'content', 'summary'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'extract_story' } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Trop de requêtes IA, réessayez dans un instant.' }), {
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
      return new Response(JSON.stringify({ error: 'Erreur lors de la transcription.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: 'Impossible de transcrire l\'audio.' }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const story = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ story }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('transcribe-story error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erreur inconnue' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
