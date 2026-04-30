import { GoogleGenAI } from "@google/genai";

export async function summarizeHeadline(title: string, apiKey: string) {
  const ai = new GoogleGenAI({ apiKey });

  //  use the 'lite' model for speed and efficiency
  const model = "gemini-3.1-flash-lite-preview";

  try {
    const result = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert creative writing assistant. I will give you a news headline. Generate 3 distinct, thought-provoking writing prompts based on it. Return ONLY a valid JSON array of 3 strings. Do not include any intro text or markdown formatting. Example: ["Prompt 1", "Prompt 2", "Prompt 3"]. Headline: ${title}`,
            },
          ],
        },
      ],
    });

    // Clean up potential markdown formatting from the AI response
    let cleanText = result.text || "[]";
    cleanText = cleanText.replace(/```json/gi, "").replace(/```/g, "").trim();

    return cleanText;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    return null; // Return null so the caller knows it failed
  }
}
