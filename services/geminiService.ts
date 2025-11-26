import { GoogleGenAI, Type } from "@google/genai";
import { Account } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const polishVisitNotes = async (rawNotes: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return rawNotes; // Fallback if no API key

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a professional field sales assistant. Summarize and polish the following rough visit notes into a concise, professional report format.
      
      Rough Notes: "${rawNotes}"
      
      Output Format:
      - Key Points
      - Action Items
      - Sentiment
      `,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for simple summary to save latency
      }
    });

    return response.text || rawNotes;
  } catch (error) {
    console.error("Gemini polish failed:", error);
    return rawNotes;
  }
};

export const suggestOptimizedRoute = async (currentLocation: {lat: number, lng: number}, customers: Account[]): Promise<string[]> => {
    const ai = getAiClient();
    if (!ai) return customers.map(c => c.id);

    // Provide a simplified list to the model
    const customerList = customers.map(c => ({
        id: c.id,
        lat: c.coordinates.lat,
        lng: c.coordinates.lng,
        name: c.name
    }));

    const prompt = `
    I am at latitude ${currentLocation.lat}, longitude ${currentLocation.lng}.
    I need to visit the following customers:
    ${JSON.stringify(customerList)}

    Please reorder these customers to form the most efficient travel route starting from my current location.
    Return ONLY a JSON array of customer IDs in the visited order.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        });
        
        const text = response.text;
        if (!text) return customers.map(c => c.id);
        return JSON.parse(text);
    } catch (e) {
        console.error("Route optimization failed", e);
        return customers.map(c => c.id);
    }
};

export const generateCustomerBio = async (companyName: string, industryHint: string): Promise<string> => {
    const ai = getAiClient();
    if(!ai) return "No AI available for bio generation.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a very short (2 sentences) professional bio for a company named "${companyName}" potentially in the "${industryHint}" industry. It should sound legitimate for a CRM placeholder.`
        });
        return response.text || "Standard corporate profile.";
    } catch (e) {
        return "Standard corporate profile.";
    }
}