// Edge function: scan-recipe
// Receives a base64 image of a handwritten or printed recipe
// Uses Lovable AI (Gemini Vision) to auto-detect language and extract structured fields
// Returns JSON ready to pre-fill the recipe form

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanRequest {
  imageBase64: string; // data URL or raw base64
  mimeType?: string; // e.g., image/jpeg
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

    const { imageBase64, mimeType = 'image/jpeg' } = (await req.json()) as ScanRequest;
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize to data URL
    const dataUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:${mimeType};base64,${imageBase64}`;

    const systemPrompt = `Tu es un expert en transcription de recettes familiales (manuscrites, imprimées, dans toutes les langues — français, anglais, espagnol, italien, etc.).

Ton travail :
1. DÉTECTE la langue de la recette et garde le texte dans cette langue d'origine (authenticité familiale).
2. EXTRAIS tous les champs structurés.
3. DÉTECTE si c'est manuscrit (handwritten) ou imprimé/tapé.
4. Si un champ est absent, mets une valeur vide (string) ou 0 (number) — ne devine jamais.

Appelle la fonction extract_recipe avec les données.`;

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
              { type: 'text', text: 'Voici la photo de la recette. Extrais tous les champs.' },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_recipe',
              description: 'Retourne les champs structurés de la recette détectée dans l\'image.',
              parameters: {
                type: 'object',
                properties: {
                  detected_language: { type: 'string', description: 'Code ISO 2 lettres (fr, en, es, it...)' },
                  is_handwritten: { type: 'boolean' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  ingredients: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Liste plate des ingrédients avec quantités, un par ligne.',
                  },
                  steps: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Étapes de préparation, une par élément, sans numérotation.',
                  },
                  preparation_time_minutes: { type: 'number' },
                  cooking_time_minutes: { type: 'number' },
                  servings: { type: 'number' },
                  difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                  dish_type: {
                    type: 'string',
                    enum: ['appetizer', 'soup', 'main', 'side', 'dessert', 'preserve', 'drink', 'sauce', 'bread', 'other'],
                  },
                  notes: { type: 'string', description: 'Annotations marginales, conseils, variantes mentionnées.' },
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
      return new Response(JSON.stringify({ error: 'Erreur lors de l\'analyse IA.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: 'Aucune recette détectée dans l\'image.' }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ recipe: extracted }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('scan-recipe error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erreur inconnue' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
