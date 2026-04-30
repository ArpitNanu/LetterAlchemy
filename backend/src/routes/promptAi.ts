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

promptAi.get("/", async (c) => {
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
  } catch (error) {
    console.log(error)
    return c.json({ error: "Failed to fetch prompts" }, 500);
  }
});

export default promptAi;
