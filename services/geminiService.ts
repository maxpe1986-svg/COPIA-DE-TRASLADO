
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getDrivingDistance = async (origin: string, destination: string): Promise<number | null> => {
  try {
    const prompt = `Calcula la distancia en kilómetros por carretera entre "${origin}" y "${destination}". Responde solo con el número de kilómetros, sin unidades. Por ejemplo: 58.7`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text.trim();
    const distance = parseFloat(text.replace(',', '.'));

    if (!isNaN(distance)) {
      return distance;
    } else {
      console.error("Gemini did not return a valid number for distance:", text);
      return null;
    }
  } catch (error) {
    console.error("Error fetching driving distance from Gemini:", error);
    return null;
  }
};
