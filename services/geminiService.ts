
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const getCoachAdvice = async (state: AppState) => {
  // Force API version v1 for stable model access
  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    apiVersion: 'v1'
  });

  const husbandDaily = state.dailyAdventures.filter(a => a.userId === 'HUSBAND').slice(-5);
  const wifeDaily = state.dailyAdventures.filter(a => a.userId === 'WIFE').slice(-5);

  // Use the custom prompt from state, or a fallback if undefined
  let masterPrompt = state.coachPrompt || "You are the Alignment Coach. Analyze the execution and finance data of this founder couple.";

  // Inject shared data into placeholders
  const prompt = masterPrompt
    .replace('{{quest}}', JSON.stringify(state.quarterlyQuest))
    .replace('{{husbandTasks}}', JSON.stringify(husbandDaily))
    .replace('{{wifeTasks}}', JSON.stringify(wifeDaily))
    .replace('{{finances}}', JSON.stringify(state.financials.slice(-15)));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.8
      }
    });

    return response.text || "I can't see the full picture yet. Sync your data and log your daily adventures.";
  } catch (error) {
    console.error("AI Error:", error);

    // Debug: List available models if access fails
    try {
      console.log("Listing available models...");
      const models = await ai.models.list();
      console.log("Available Models:", models);
    } catch (listError) {
      console.error("Could not list models:", listError);
    }

    return "Coach is meditating. Please check the browser console for details.";
  }
};
