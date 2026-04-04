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

posts.post("/create", async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  const userId = c.get("userId");

  const validInputdata = PostSchema.safeParse(body);
  if (!validInputdata.success) {
    return c.json({
      msg: "invalid data input",
    });
  } else {
    const titleData = validInputdata.data?.title;
    // const slugFormat = titleData?.replace(" ", "_");
    // console.log(slugFormat);
    const createPosts = await prisma.post.create({
      data: {
        title: validInputdata.data.title,
        content: validInputdata.data?.content,
        authorId: Number(userId),
        published: false,
      },
    });
    return c.json({
      msg: "post created successfully",
      id: createPosts.id,
      createdAt: createPosts.createdAt,
    });
  }
});

posts.get("/posts", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = c.get("userId");
  try {
    const getPosts = await prisma.post.findMany({
      where: {
        authorId: Number(userId),
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return c.json({ getPosts });
  } catch (error) {
    console.error("couldn't find the posts for you:", error);
  }
});

posts.patch("/edit/:id", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const postId = Number(c.req.param("id"));
  const body = await c.req.json();
  const validInputdata = PostSchema.safeParse(body);

  if (!validInputdata.success) return c.json({ msg: "Invalid input" }, 400);
  else {
    try {
      const findpost = await prisma.post.findFirst({
        where: {
          id: postId,
          authorId: userId,
        },
      });
      if (findpost === null) {
        return c.json({ msg: "post not found" }, 404);
      } else {
        const editPost = await prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            title: validInputdata.data?.title,
            content: validInputdata.data?.content,
          },
        });
        return c.json(
          {
            msg: "post update succesfully ",
            editPost: {
              id: editPost.id,
            },
          },
          200,
        );
      }
    } catch (error) {
      console.error("not able to update user", error);
      return c.json({ msg: "internal server error" });
    }
  }
});

posts.delete("/post/delete/:id", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const postId = Number(c.req.param("id"));
  try {
    const findPost = await prisma.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
      },
    });
    if (findPost === null) {
      c.json({ msg: "post not found" });
    } else {
      const deletePost = await prisma.post.delete({
        where: {
          id: postId,
        },
      });
      return c.json({ msg: "user as been deleted" });
    }
  } catch (error) {
    return console.error("User not deleted", error);
  }
});

posts.get("/posts/:id", async (c) => {
  const prisma = getPrisma(c.env);
  const Userid = Number(c.get("userId"));
  const postId = Number(c.req.param("id"));
  try {
    const findPost = await prisma.post.findFirst({
      where: {
        id: postId,
        published: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    if (findPost === null) {
      return c.json(
        {
          msg: "post didn't exist",
        },
        404,
      );
    } else {
      return c.json({ findPost });
    }
  } catch (error) {
    return c.json({ error });
  }
});

export default posts;
