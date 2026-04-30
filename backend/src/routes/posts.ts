import { Hono } from "hono";
import { Env } from "../types/env";
import { getPrisma } from "../db/prisma";
import { PostSchema } from "../schemas/auth.schema";
import { authmiddleware } from "../middleware/auth.middleware";

const posts = new Hono<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>();

posts.use("*", async (c, next) => {
// added || c.req.path.includes("/prompts") to bypass auth!
  if (c.req.path.includes("/public") || c.req.path.includes("/prompts")) {
    return await next();
  }
  return await authmiddleware(c, next);
});

posts.post("/create", async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  const userId = Number(c.get("userId"));

  const validInputdata = PostSchema.safeParse(body);
  try {
    if (!validInputdata.success) {
      return c.json({
        msg: "invalid data input",
      });
    } else {
      //const titleData = validInputdata.data?.title;
      // const slugFormat = titleData?.replace(" ", "_");
      // console.log(slugFormat);
      const createPosts = await prisma.post.create({
        data: {
          title: validInputdata.data.title,
          content: validInputdata.data?.content,
          authorId: userId,
          published: false,
        },
      });
      console.log("post created");

      return c.json({
        success: true,
        msg: "post created successfully",
        data: {
          id: createPosts.id,
          createdAt: createPosts.createdAt,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return c.json({ msg: "internal server error" }, 500);
  }
});

posts.get("/posts/latest", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  try {
    const getDraft = await prisma.post.findFirst({
      where: {
        authorId: userId,
        published: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
      },
    });
    return c.json({
      success: true,
      messgae: "Draft sucessfully fetched",
      data: getDraft || null,
    });
  } catch (error) {
    console.error(error);
    return c.json({ msg: "internal server error" }, 500);
  }
});
//get all users posts
posts.get("/posts", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  try {
    const getDraft = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        likes: true,
        comments: true,
        published: true,
      },
    });
    return c.json({
      success: true,
      messgae: "Draft sucessfully fetched",
      data: getDraft || null,
    });
  } catch (error) {
    console.error(error);
    return c.json({ msg: "internal server error" }, 500);
  }
});

posts.get("/public", async (c) => {
  const prisma = getPrisma(c.env);
  try {
    const getPublicPosts = await prisma.post.findMany({
      where: {
        published: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    const formated = getPublicPosts.map((post) => ({
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
      content: post.content,
      author: post.author,

      likes: post._count.likes,
      comments: post._count.comments,
    }));
    return c.json({
      success: true,
      message: "public post fetch",
      data: formated,
    });
  } catch (error) {
    console.error(error);
    return c.json({ msg: "internal server error" }, 500);
  }
});

// Public route to fetch a single post by ID
posts.get("/public/:id", async (c) => {
  const prisma = getPrisma(c.env);
  const postId = Number(c.req.param("id"));

  try {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        published: true, // only show published posts to the public
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true, // Added author ID for the ReaderPage
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return c.json({ msg: "Post not found or not published" }, 404);
    }

    return c.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error(error);
    return c.json({ msg: "Internal server error" }, 500);
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
            //published: true,
          },
          select: {
            id: true,
            title: true,
            content: true,
            published: true,
          },
        });
        return c.json(
          {
            success: true,
            message: "post update succesfully ",
            data: editPost,
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
      return c.json({ success: true, message: "user as been deleted" });
    }
  } catch (error) {
    console.error(error);
    return c.json({ msg: "internal server error" }, 500);
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
        authorId: Userid,
      },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt:true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count:{
          select:{
            likes:true,
            comments:true,
          }
        },
      },
    });
    if (!findPost) {
      return c.json(
        {
          msg: "post didn't exist",
        },
        404,
      );
    } else {
      return c.json({ success: true, data: findPost });
    }
  } catch (error) {
    console.error(error);
    return c.json({ msg: "internal server error" }, 500);
  }
});

// backend/src/routes/posts.ts

// Add this new route
posts.patch("/publish/:id", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const postId = Number(c.req.param("id"));

  try {
    // We verify the post belongs to the user before publishing
    const post = await prisma.post.findFirst({
      where: { id: postId, authorId: userId },
    });

    if (!post) return c.json({ msg: "Post not found" }, 404);

    const publishedPost = await prisma.post.update({
      where: { id: postId },
      data: { published: true }, // The backend sets this, not the frontend
    });

    return c.json({ success: true, data: publishedPost });
  } catch (error) {
    return c.json({ msg: "Internal server error" }, 500);
  }
});

export default posts;
