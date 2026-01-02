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

        // Try v1 endpoint as it is more stable for general models
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
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