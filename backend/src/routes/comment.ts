import { Hono } from "hono";

import { Env } from "../types/env";

import { getPrisma } from "../db/prisma";
import { CommentSchema } from "../schemas/auth.schema";

const comment = new Hono<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>();

comment.get("/post/:id/comments", async (c) => {
  const prisma = getPrisma(c.env);
  const postId = Number(c.req.param("id"));

  const getAllPosts = prisma.comment.findMany({
    where: {
      postId: postId,
    },
    select: {
      text: true,
    },
  });
  return c.json({ getAllPosts });
});

comment.post("posts/:id/comment", async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  const postId = Number(c.req.param("id"));
  const userId = Number(c.get("userId"));
  const validatedData = CommentSchema.safeParse(body);
  if (!validatedData.success) {
    return c.json({ msg: "invalid data input" }, 400);
  }
  try {
    const createPost = await prisma.comment.create({
      data: {
        text: validatedData.data.text,
        authorId: userId,
        postId: postId,
      },
      select: {
        text: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return c.json({
      createPost,
    });
  } catch (error) {}
});

comment.patch("post/:id/comment/edit", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const commentId = Number(c.req.param("id"));
});

comment.delete("post/:id/comments", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const commentId = Number(c.req.param("id"));
  const commentFind = prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId: userId,
    },
  });
  if (commentFind == null) {
    return c.json({ msg: "user is not allow to delete" });
  } else {
    const commentDelete = prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
    return c.json({ msg: "user has been deleted successfully" });
  }
});
