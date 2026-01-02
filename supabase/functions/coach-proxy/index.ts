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
            const msg = 'GEMINI_API_KEY is missing in Supabase. Please go to Settings -> Edge Functions -> Click "Manage Secrets" or look for the Secrets section and add GEMINI_API_KEY.';
            console.error(msg);
            return new Response(JSON.stringify({ error: msg }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Returning 200 so the frontend can read the JSON cleanly
            });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

        const geminiResponse = await fetch(apiUrl, {
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

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            return new Response(JSON.stringify({
                error: `Gemini API Error (${geminiResponse.status})`,
                details: data
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Returning 200 for easier frontend debugging
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
