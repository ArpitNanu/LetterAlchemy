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
              text: `Summarize this  headline into 3 bullet points: ${title}`,
            },
          ],
        },
      ],
    });

    return result.text;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    return null; // Return null so the caller knows it failed
  }
}
