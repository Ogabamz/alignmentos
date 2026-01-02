import { AppState } from "../types";

// Diagnostic tool to help find the right model name
const listAvailableModels = async (apiKey: string) => {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        console.log("--- AI DIAGNOSTICS ---");
        console.log("Valid Models for this key:", data.models?.map((m: any) => m.name.replace('models/', '')) || "None found");
        console.log("----------------------");
    } catch (e) {
        console.error("Failed to list models:", e);
    }
};

let diagnosticDone = false;

export const getCoachAdvice = async (state: AppState) => {
    const husbandDaily = state.dailyAdventures.filter(a => a.userId === 'HUSBAND').slice(-5);
    const wifeDaily = state.dailyAdventures.filter(a => a.userId === 'WIFE').slice(-5);

    let masterPrompt = state.coachPrompt || "You are the Alignment Coach. Analyze the execution and finance data of this founder couple.";

    const prompt = masterPrompt
        .replace('{{quest}}', JSON.stringify(state.quarterlyQuest))
        .replace('{{husbandTasks}}', JSON.stringify(husbandDaily))
        .replace('{{wifeTasks}}', JSON.stringify(wifeDaily))
        .replace('{{finances}}', JSON.stringify(state.financials.slice(-15)));

    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        console.log("Using API Key:", apiKey ? "FOUND" : "MISSING");

        if (!diagnosticDone && apiKey) {
            listAvailableModels(apiKey);
            diagnosticDone = true;
        }

        // Using user-provided curl structure: v1beta + X-goog-api-key header
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

        const response = await fetch(apiUrl, {
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

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("AI API ERROR BODY:", errorBody);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is meditating (No response text).";

    } catch (error) {
        console.error("AI Error:", error);
        return "Coach is meditating. Please check the browser console for details.";
    }
};