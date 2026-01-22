import { Hono } from "hono";

import { Env } from "../types/env";

import { getPrisma } from "../db/prisma";
import { PostSchema } from "../schemas/auth.schema";

const posts = new Hono<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>();

posts.post("/posts/create", async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  const userId = c.get("userId");

  const validInput = PostSchema.safeParse(body);

  if (validInput.error) {
    return c.json({
      msg: "invalid data input",
    });
  } else {
    const getuserPosts = await prisma.post.create({
      data: {
        title: validInput.data.title,
        content: validInput.data?.content,
        authorId: Number(userId),
      },
    });
    return c.json({
      id: getuserPosts.id,
      title: getuserPosts.title,
      createdAt: getuserPosts.createdAt,
    });
  }
});

posts.get("/post", async (c) => {

});

export default posts;
