// Edge function: transcribe-recipe
// Receives base64 audio (webm/mp3/wav) of someone dictating a recipe
// Uses Lovable AI (Gemini audio) to transcribe + structure in one call
// Returns same JSON shape as scan-recipe

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscribeRequest {
  audioBase64: string;
  mimeType?: string; // audio/webm, audio/mp3, audio/wav, audio/mp4
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { audioBase64, mimeType = 'audio/webm' } = (await req.json()) as TranscribeRequest;
    if (!audioBase64) {
      return new Response(JSON.stringify({ error: 'audioBase64 is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dataUrl = audioBase64.startsWith('data:')
      ? audioBase64
      : `data:${mimeType};base64,${audioBase64}`;

    const systemPrompt = `Tu es un expert qui transcrit et structure des recettes dictées à voix haute par des personnes (souvent des aînés racontant une recette familiale).

Ton travail :
1. DÉTECTE la langue parlée et garde le texte dans cette langue (authenticité).
2. STRUCTURE l'audio en champs : titre, ingrédients (liste), étapes (liste), temps, etc.
3. Si la personne raconte une histoire ("ma mère faisait toujours ça à Noël..."), mets-la dans "notes".
4. Si un champ n'est pas mentionné, laisse vide ou 0 — ne devine jamais.

Appelle la fonction extract_recipe.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Voici la dictée audio de la recette. Transcris et structure tout.' },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_recipe',
              description: 'Retourne les champs structurés de la recette dictée.',
              parameters: {
                type: 'object',
                properties: {
                  detected_language: { type: 'string' },
                  is_handwritten: { type: 'boolean', description: 'Toujours false pour audio.' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  ingredients: { type: 'array', items: { type: 'string' } },
                  steps: { type: 'array', items: { type: 'string' } },
                  preparation_time_minutes: { type: 'number' },
                  cooking_time_minutes: { type: 'number' },
                  servings: { type: 'number' },
                  difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                  dish_type: {
                    type: 'string',
                    enum: ['appetizer', 'soup', 'main', 'side', 'dessert', 'preserve', 'drink', 'sauce', 'bread', 'other'],
                  },
                  notes: { type: 'string', description: 'Histoire, anecdote, conseils racontés pendant la dictée.' },
                },
                required: [
                  'detected_language', 'is_handwritten', 'title', 'description',
                  'ingredients', 'steps', 'preparation_time_minutes', 'cooking_time_minutes',
                  'servings', 'difficulty', 'dish_type', 'notes',
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_recipe' } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Trop de requêtes IA, réessayez dans un instant.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Crédits IA épuisés. Ajoutez des crédits dans votre espace Lovable.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errText);
      return new Response(JSON.stringify({ error: 'Erreur lors de la transcription IA.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: 'Aucune recette détectée dans l\'audio.' }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    extracted.is_handwritten = false; // safety

    return new Response(JSON.stringify({ recipe: extracted }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('transcribe-recipe error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erreur inconnue' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
