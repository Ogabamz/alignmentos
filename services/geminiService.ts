
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const getCoachAdvice = async (state: AppState) => {
  // Use default API version (v1beta) which maps to most models correctly
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const husbandDaily = state.dailyAdventures.filter(a => a.userId === 'HUSBAND').slice(-5);
  const wifeDaily = state.dailyAdventures.filter(a => a.userId === 'WIFE').slice(-5);

  let masterPrompt = state.coachPrompt || "You are the Alignment Coach. Analyze the execution and finance data of this founder couple.";

  const prompt = masterPrompt
    .replace('{{quest}}', JSON.stringify(state.quarterlyQuest))
    .replace('{{husbandTasks}}', JSON.stringify(husbandDaily))
    .replace('{{wifeTasks}}', JSON.stringify(wifeDaily))
    .replace('{{finances}}', JSON.stringify(state.financials.slice(-15)));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-002",
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.8 }
    });

    return response.text || "I can't see the full picture yet. Sync your data and log your daily adventures.";
  } catch (error) {
    console.error("AI Error:", error);

    try {
      console.log("Listing available models...");
      const response: any = await ai.models.list();
      // Extract names from pageInternal which we saw in your logs
      const models = response.pageInternal || response.models || [];
      console.log("VALID MODEL NAMES:", models.map((m: any) => m.name));
    } catch (listError) {
      console.error("Could not list models:", listError);
    }

    return "Coach is meditating. Please check the browser console for the 'VALID MODEL NAMES' list.";
  }
};
