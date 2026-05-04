import { Hono } from "hono";

import { Env } from "../types/env";

import { getPrisma } from "../db/prisma";
import { CommentSchema } from "../schemas/auth.schema";

import { authmiddleware } from "../middleware/auth.middleware";

const comment = new Hono<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>();

// Public: Get all comments for a post
comment.get("/:postId", async (c) => {
  const prisma = getPrisma(c.env);
  const postId = Number(c.req.param("postId"));

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // Map data to ensure authorId is at the top level for frontend convenience
    const formattedComments = comments.map(c => ({
      ...c,
      authorId: c.authorId
    }));
    return c.json({ success: true, data: formattedComments });
  } catch (error) {
    return c.json({ success: false, message: "Failed to fetch comments" }, 500);
  }
});

// Protected: Post a comment
comment.post("/:postId", authmiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  const postId = Number(c.req.param("postId"));
  const userId = Number(c.get("userId"));

  const validatedData = CommentSchema.safeParse(body);
  if (!validatedData.success) {
    return c.json({ success: false, msg: "Invalid comment text" }, 400);
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        text: validatedData.data.text,
        authorId: userId,
        postId: postId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return c.json({ success: true, data: newComment });
  } catch (error) {
    return c.json({ success: false, message: "Failed to post comment" }, 500);
  }
});

// Protected: Delete a comment
comment.delete("/:id", authmiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const commentId = Number(c.req.param("id"));

  try {
    const commentRecord = await prisma.comment.findFirst({
      where: {
        id: commentId,
        authorId: userId,
      },
    });

    if (!commentRecord) {
      return c.json({ success: false, msg: "Unauthorized or comment not found" }, 403);
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return c.json({ success: true, msg: "Comment deleted successfully" });
  } catch (error) {
    return c.json({ success: false, message: "Failed to delete comment" }, 500);
  }
});

export default comment;
