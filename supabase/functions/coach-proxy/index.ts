import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-goog-api-key',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { prompt } = await req.json();
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        if (!apiKey) {
            const msg = 'GEMINI_API_KEY is missing in Supabase. Please go to Settings -> Edge Functions -> Click "Manage Secrets" and add GEMINI_API_KEY.';
            return new Response(JSON.stringify({ error: msg }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Following user's curl hint: gemini-2.0-flash
        let model = "gemini-2.0-flash";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        let geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey
            },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": prompt }]
                }]
            })
        });

        let data = await geminiResponse.json();

        // Fallback logic for 404 or 429
        if (!geminiResponse.ok && (geminiResponse.status === 404 || geminiResponse.status === 429)) {
            console.log(`DEBUG: ${model} failed (${geminiResponse.status}), trying gemini-flash-latest...`);
            model = "gemini-flash-latest";
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
            geminiResponse = await fetch(fallbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
                body: JSON.stringify({ "contents": [{ "parts": [{ "text": prompt }] }] })
            });
            data = await geminiResponse.json();
        }

        if (!geminiResponse.ok) {
            return new Response(JSON.stringify({
                error: `Gemini API Error (${geminiResponse.status}): ${data.error?.message || 'Unknown'}`,
                details: data
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});
