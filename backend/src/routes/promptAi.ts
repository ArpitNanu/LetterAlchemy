import { Hono } from "hono";
import { Env } from "../types/env";
import { getPrisma } from "../db/prisma";
import { positive } from "zod";

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

export default promptAi;
