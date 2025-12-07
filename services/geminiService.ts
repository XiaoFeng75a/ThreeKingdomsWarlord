import { GoogleGenAI, Type } from "@google/genai";
import { General, GeneralState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Flash for speed as per instructions for basic text tasks
const MODEL_NAME = 'gemini-2.5-flash';

export interface SearchResult {
  eventDescription: string;
  foundGold?: number;
  foundFood?: number;
  foundGeneral?: Omit<General, 'id' | 'factionId' | 'locationCityId' | 'state'>;
}

export const searchCityEvent = async (cityName: string, generalName: string): Promise<SearchResult> => {
  try {
    const prompt = `
      You are a game master for a Three Kingdoms strategy game.
      General ${generalName} is searching the city of ${cityName} for talent or resources.
      Generate a random event result.
      
      Possibilities (choose one based on weighted randomness, most likely just resources):
      1. Found a small amount of gold or food (Common).
      2. Found a local talent/general (Rare - 15% chance).
      3. Just a local flavor event with no gain (Uncommon).

      Return strictly valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            eventDescription: { type: Type.STRING, description: "A brief, atmospheric description of what happened in 1-2 sentences." },
            foundGold: { type: Type.INTEGER, description: "Amount of gold found (0 if none)." },
            foundFood: { type: Type.INTEGER, description: "Amount of food found (0 if none)." },
            foundGeneral: {
              type: Type.OBJECT,
              description: "The general found, if any. Null if none.",
              nullable: true,
              properties: {
                name: { type: Type.STRING },
                war: { type: Type.INTEGER },
                intel: { type: Type.INTEGER },
                pol: { type: Type.INTEGER },
                chr: { type: Type.INTEGER },
                bio: { type: Type.STRING, description: "A short bio for the new general." }
              }
            }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as SearchResult;
    }
    throw new Error("No response text");

  } catch (error) {
    console.error("Gemini Search Error:", error);
    // Fallback if API fails
    return {
      eventDescription: `General ${generalName} searched ${cityName} but found nothing of note amidst the bustling markets.`,
      foundGold: 10,
    };
  }
};

export const generateRumor = async (turn: number): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Generate a one-sentence random rumor or news event relevant to the Three Kingdoms era for Turn ${turn}. Examples: "Locals speak of a dragon sighting near the river.", "Harvests are poor in the north due to locusts.", "A wandering sage is teaching tactics in the capital."`
        });
        return response.text || "The land is quiet.";
    } catch (e) {
        return "The winds of change are blowing.";
    }
}
