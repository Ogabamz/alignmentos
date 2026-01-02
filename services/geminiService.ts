import { AppState } from "../types";

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

        // Fallback to gemini-1.5-flash which has a stable free tier
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is meditating (No response text).";

    } catch (error) {
        console.error("AI Error:", error);
        return "Coach is meditating. Please check the browser console for details.";
    }
};