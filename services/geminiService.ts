import { AppState } from "../types";
import { supabase } from "./supabaseService";

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
        console.log("Coach: Requesting advice via Supabase Edge Function Proxy...");

        const { data, error } = await supabase.functions.invoke('coach-proxy', {
            body: { prompt }
        });

        if (error) {
            console.error("Coach: Edge Function Error:", error);
            throw new Error(`Edge Function Error: ${error.message}`);
        }

        if (!data) {
            throw new Error("Coach: No data returned from proxy.");
        }

        // The Edge Function returns the raw Gemini response
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Coach is meditating (No response text).";

    } catch (error) {
        console.error("Coach: Error:", error);
        return "Coach is meditating. Please check the browser console for details.";
    }
};
