
import { GoogleGenAI, Type } from "@google/genai";
import { KarmaType, AIResponse, Language } from "../types";

// Updated Gemini client initialization to strictly follow the SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeKarma = async (type: KarmaType, text: string, lang: Language = 'en'): Promise<AIResponse> => {
  const model = "gemini-3-flash-preview";
  
  const languageNames: Record<Language, string> = {
    en: "English",
    zh: "Chinese",
    vi: "Vietnamese",
    th: "Thai",
    ko: "Korean",
    ja: "Japanese",
    es: "Spanish"
  };

  const systemInstruction = `
    You are the Cosmic Arbiter of Karma. 
    Users will submit either a "MERIT" (a good deed or positive growth) or "BAD_LUCK" (a misfortune or negative event).
    Your task:
    1. Provide a short, poetic, and mystical feedback (max 20 words) IN THE SPECIFIED LANGUAGE: ${languageNames[lang]}.
    2. Assign a "scoreImpact" which is an integer. 
       - For MERIT: +5 to +50 based on the magnitude of the deed.
       - For BAD_LUCK: -5 to -50 based on the severity of the misfortune.
    3. Suggest a single emoji symbol representing the energy of the event.
    
    CRITICAL: You MUST respond in ${languageNames[lang]}.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Type: ${type}, Description: ${text}, Language: ${lang}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            scoreImpact: { type: Type.INTEGER },
            symbol: { type: Type.STRING }
          },
          required: ["feedback", "scoreImpact", "symbol"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini AI error:", error);
    return {
      feedback: type === KarmaType.MERIT ? "A seed of light planted in the void." : "The shadow dances across your path.",
      scoreImpact: type === KarmaType.MERIT ? 10 : -10,
      symbol: type === KarmaType.MERIT ? "✨" : "🌑"
    };
  }
};

export const consultOracle = async (prompt: string, lang: Language = 'en'): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const languageNames: Record<Language, string> = {
    en: "English", zh: "Chinese", vi: "Vietnamese", th: "Thai", ko: "Korean", ja: "Japanese", es: "Spanish"
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: `You are the Great Oracle of Zidous. A user is asking for spiritual guidance. Provide a mystical, wise, and encouraging response in ${languageNames[lang]}. Keep it under 60 words.`,
      }
    });
    return response.text || "The stars are silent today. Try again when the winds shift.";
  } catch (error) {
    return "The connection to the ethereal plane is weak.";
  }
};
