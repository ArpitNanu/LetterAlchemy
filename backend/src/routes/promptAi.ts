import { Hono } from "hono";
import { Env } from "../types/env";
import { getPrisma } from "../db/prisma";

import { extractTextFromTiptap } from "../utils/extractTextFromTiptap";
import { generateGeminiResponse } from "../services/gemini";


const promptAi = new Hono<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>();

// --- 🎓 ARCHITECTURE LEARNING MOMENT: The Slash Trap ---
// We use "" (empty string) instead of "/" here.
// If the parent mount is "/api/v1/prompts", then "" matches it exactly.
// If we used "/", the URL would have to be "/api/v1/prompts/" (with a slash).
// -------------------------------------------------------
promptAi.get("", async (c) => {
  const prisma = getPrisma(c.env);
  try {
    const prompt = await prisma.newsHeadline.findMany({
    where :{
      text:{
        not:null,
      }
     
    },
    select:{
        text:true,
        id:true,
      url:true,
      title:true,
      category:true,
    }    
  });
  return c.json({ 
    success:true,
    msg:"headline fetch successfully",
    data:{prompt} 
  });
  } catch (error: any) {
    console.log(error)
    return c.json({ error: "Failed to fetch prompts", details: error.message }, 500);
  }
});


promptAi.post("/initalresponse/:id", async (c) => {
  const prisma = getPrisma(c.env);
  const postId = Number(c.req.param("id"));

  try {
    // ---------------------------------------------
    // Fetch article
    // ---------------------------------------------
    const findPost = await prisma.post.findFirst({
      where: {
        id: postId,
        published: true,
      },
      select: {
        title: true,
        content: true,
      },
    });

    if (!findPost) {
      return c.json(
        {
          success: false,
          msg: "Post not found",
        },
        404
      );
    }

    // ---------------------------------------------
    // Get user question
    // ---------------------------------------------
    const { question } = await c.req.json();

    if (!question) {
      return c.json(
        {
          success: false,
          msg: "Question is required",
        },
        400
      );
    }

    // ---------------------------------------------
    // Extract readable article text
    // ---------------------------------------------
    const readableText = extractTextFromTiptap(findPost.content);

    const title = findPost.title || "Untitled Post";

    // ---------------------------------------------
    // Final AI prompt
    // ---------------------------------------------
    const finalPrompt = `
Question asked by user:
${question}

Here is the title of the post:
${title}

Here is the content of the post:
${readableText}
`;
    // ------------------------------------------
    // Run BOTH models in parallel
    // -------------------------------------------
    const [aiResponse, geminiResponse] = await Promise.all([
      c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          {
            role: "system",
            content:
              "Summarize article meaning in ONE short sentence under 12 words only. Be concise and clear.",
          },
          {
            role: "user",
            content: `Title: ${title}\n\nContent: ${readableText}`,
          },
        ],
      }),

      generateGeminiResponse(
        finalPrompt,
        c.env.GEMINI_API_KEY
      ),
    ]);

    // ---------------------------------------------
    // Return responses
    // ---------------------------------------------
    return c.json({
      success: true,
      msg: "AI response generated successfully",
      data: {
        workersAI: aiResponse,
        gemini: geminiResponse,
      },
    });
  } catch (error: any) {
    console.error(error);

    return c.json(
      {
        success: false,
        error: "Failed to generate AI response",
        details: error.message,
      },
      500
    );
  }
});

export default promptAi;
