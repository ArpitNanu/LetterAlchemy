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
        published: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
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

// New Search Route
posts.get("/public/search", async (c) => {
  const prisma = getPrisma(c.env);
  const query = c.req.query("q");

  if (!query || query.length < 2) {
    return c.json({
      success: true,
      data: [],
    });
  }

  try {
    const searchResults = await prisma.post.findMany({
      where: {
        published: true,
        title: {
          // 🎓 LOGIC: PostgreSQL Full-Text Search expects words to be joined by operators.
          // This takes "My Post" and turns it into "My & Post" so the database 
          // searches for titles containing BOTH words.
          search: query.trim().split(/\s+/).join(" & "), 
        } as any,
      },
      select: {
        id: true,
        title: true,
      },
      take: 10, // Limit results for the dropdown
    });

    return c.json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error("Search Error:", error);
    // Fallback to simple contains if search vector fails (useful for partial words)
    const fallbackResults = await prisma.post.findMany({
      where: {
        published: true,
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        title: true,
      },
      take: 10,
    });
    return c.json({
      success: true,
      data: fallbackResults,
    });
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

posts.delete("/posts/:id", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const postId = Number(c.req.param("id"));

  try {
    const post = await prisma.post.findFirst({
      where: { id: postId, authorId: userId },
    });

    if (!post) return c.json({ msg: "Post not found" }, 404);

    await prisma.post.delete({
      where: { id: postId },
    });

    return c.json({ success: true, msg: "Post deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    return c.json({ msg: "Internal server error" }, 500);
  }
});

// Toggle Like
posts.post("/like/:id", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const postId = Number(c.req.param("id"));

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_authorId: { postId, authorId: userId },
      },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return c.json({ success: true, message: "Unliked", liked: false });
    } else {
      await prisma.like.create({
        data: { postId, authorId: userId },
      });
      return c.json({ success: true, message: "Liked", liked: true });
    }
  } catch (error) {
    console.error("Like Toggle Error:", error);
    return c.json({ success: false, msg: "Internal server error" }, 500);
  }
});

// Toggle Bookmark
posts.post("/bookmark/:id", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const postId = Number(c.req.param("id"));

  try {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        postId_authorId: { postId, authorId: userId },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
      return c.json({ success: true, message: "Removed bookmark", bookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: { postId, authorId: userId },
      });
      return c.json({ success: true, message: "Bookmarked", bookmarked: true });
    }
  } catch (error) {
    console.error("Bookmark Toggle Error:", error);
    return c.json({ success: false, msg: "Internal server error" }, 500);
  }
});

// Get all Bookmarks for a user
posts.get("/bookmarks", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      // 🎓 ARCHITECTURE: We use 'include' here to automatically join the post data. 
      // This is much faster than fetching bookmark IDs and then running a second query for the posts!
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            author: {
              select: {
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
        },
      },
    });

    // Formatting it so the frontend receives a clean array of posts, 
    // rather than an array of bookmarks that contain posts inside them.
    const formattedPosts = bookmarks.map((b) => ({
      ...b.post,
      // We keep the bookmark date in case we want to show "Bookmarked on X"
      bookmarkedAt: b.createdAt,
      // Tell the frontend PostCard component that this is absolutely bookmarked!
      isBookmarked: true,
    }));

    return c.json({ success: true, data: formattedPosts });
  } catch (error) {
    console.error("Fetch Bookmarks Error:", error);
    return c.json({ success: false, msg: "Internal server error" }, 500);
  }
});

export default posts;

