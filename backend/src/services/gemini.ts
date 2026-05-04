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
              text: `Act as an expert, creative writing assistant. I will provide you with a news headline.
Analyze the headline and generate exactly 3 distinct, thought-provoking writing prompts inspired by its themes. Return valid JSON using the exact schema below. 

Schema:
[
  "String",
  "String",
  "String"
]

EXAMPLE:
Headline: Scientists Discover New Deep Sea Ecosystem
JSON Response:
[
  "Write a story from the perspective of a creature living in this newly discovered ecosystem who encounters a submarine for the first time.",
  "A marine biologist makes a discovery in the deep sea that challenges everything humanity knows about evolution. What do they find?",
  "In a future where the surface world is uninhabitable, a society has built a city mimicking the newly discovered deep sea ecosystem. Describe their daily life."
]

Headline: ${title}`,
            },
          ],
        },
      ],
    });

    // Clean up potential markdown formatting from the AI response
    let cleanText = result.text || "[]";
    cleanText = cleanText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return cleanText;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    return null; // Return null so the caller knows it failed
  }
}
