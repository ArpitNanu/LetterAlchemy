import { Hono } from "hono";
import { Env } from "../types/env";
import { getPrisma } from "../db/prisma";
import { PostSchema } from "../schemas/auth.schema";
import { authmiddleware } from "../middleware/auth.middleware";
// Import our slug utility functions. generateUniqueSlug handles both
// slug creation AND collision resolution against the database.
import { generateUniqueSlug } from "../utils/slug";

const posts = new Hono<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>();

// --- 🎓 ARCHITECTURE LEARNING MOMENT: Top-Down Security ---
// In Hono, routes are matched in the order they are defined.
// 1. PUBLIC ROUTES (Top): We place these first so they are matched and 
//    returned BEFORE the middleware (the bouncer) even sees them.
// 2. MIDDLEWARE (Middle): This acts as a wall for everything below it.
// 3. PRIVATE ROUTES (Bottom): These are automatically protected by the middleware.
// -------------------------------------------------------

// --- 🎓 PUBLIC ROUTES ---
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
        slug: true,     // Fetch slug from DB so it's available in the map below
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
      slug: post.slug,   // ← include slug so PostCard can build /post/:slug links
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
  } catch (error: any) {
    console.error(error);
    return c.json({ msg: "internal server error", details: error.message }, 500);
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
          search: query.trim().split(/\s+/).join(" & "), 
        } as any,
      },
      select: {
        id: true,
        title: true,
        // Return slug so the frontend SearchBox can navigate to /post/:slug
        // instead of falling back to the numeric /post/:id
        slug: true,
      },
      take: 10,
    });

    return c.json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error("Search Error:", error);
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

// --- NEW: Public route to fetch a single post by its SLUG ---
// Why a new route instead of modifying /public/:id?
// Because :id expects a NUMBER but :slug is a STRING.
// Mixing the two in one route would require ugly type-guessing logic.
// Keeping them separate is cleaner and follows the Single Responsibility Principle.
posts.get("/public/slug/:slug", async (c) => {
  const prisma = getPrisma(c.env);

  // c.req.param("slug") reads the :slug part from the URL.
  // e.g., for GET /public/slug/my-first-post, this gives "my-first-post"
  const slug = c.req.param("slug");

  try {
    const post = await prisma.post.findFirst({
      where: {
        slug: slug,       // Look up by slug, not by ID
        published: true,  // Only return published posts to the public
      },
      select: {
        id: true,
        title: true,
        slug: true,       // Return slug so frontend can confirm/use it
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
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

    // If no post found with this slug, return a 404.
    // This correctly tells the browser "this page does not exist."
    if (!post) {
      return c.json({ msg: "Post not found" }, 404);
    }

    return c.json({ success: true, data: post });
  } catch (error) {
    console.error(error);
    return c.json({ msg: "Internal server error" }, 500);
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
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true, // Return the slug for ID-based lookups too
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
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

// --- 🎓 ARCHITECTURE: Private Routes (Protected) ---
// We apply the authmiddleware ONLY to these routes.
posts.post("/create", authmiddleware, async (c) => {
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
  } catch (error: any) {
    console.error(error);
    return c.json({ msg: "internal server error", details: error.message }, 500);
  }
});

posts.get("/posts/latest", authmiddleware, async (c) => {
  //Instead of a big wall at the entrance, we've put a lock on each individual private room. This means the /public routes are now technically incapable of hitting the authentication error.
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
  } catch (error: any) {
    console.error(error);
    return c.json({ msg: "internal server error", details: error.message }, 500);
  }
});
//get all users posts
posts.get("/posts", authmiddleware, async (c) => {
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
  } catch (error: any) {
    console.error(error);
    return c.json({ msg: "internal server error", details: error.message }, 500);
  }
});

posts.patch("/edit/:id", authmiddleware, async (c) => {
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

posts.get("/posts/:id", authmiddleware, async (c) => {
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
  } catch (error: any) {
    console.error(error);
    return c.json({ msg: "internal server error", details: error.message }, 500);
  }
});

// backend/src/routes/posts.ts

posts.patch("/publish/:id", authmiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const postId = Number(c.req.param("id"));

  try {
    // Verify the post belongs to the requesting user before doing anything.
    // This prevents user A from publishing user B's post.
    const post = await prisma.post.findFirst({
      where: { id: postId, authorId: userId },
    });

    if (!post) return c.json({ msg: "Post not found" }, 404);

    // --- SLUG GENERATION ---
    // We only generate the slug at publish time (not at draft-create time)
    // because the title is most likely to be finalized when the author publishes.
    //
    // We also check: does this post already have a slug?
    // This handles the case where a user un-publishes and re-publishes the same post.
    // We don't want to regenerate the slug and break existing links.
    let slug = post.slug;
    if (!slug) {
      // generateUniqueSlug accepts MinimalPrismaClient — which the edge client satisfies.
      slug = await generateUniqueSlug(post.title, prisma);
    }

    const publishedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        published: true, // Set the post as live
        slug: slug,      // Save the slug — this is the permanent URL identifier
      },
    });

    return c.json({
      success: true,
      data: {
        id: publishedPost.id,
        slug: publishedPost.slug, // Return the slug to the frontend so it can navigate to it
      },
    });
  } catch (error) {
    console.error("Publish error:", error);
    return c.json({ msg: "Internal server error" }, 500);
  }
});

posts.delete("/posts/:id", authmiddleware, async (c) => {
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
posts.post("/like/:id", authmiddleware, async (c) => {
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
posts.post("/bookmark/:id", authmiddleware, async (c) => {
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
posts.get("/bookmarks", authmiddleware, async (c) => {
  //Instead of a big wall at the entrance, we've put a lock on each individual private room. This means the /public routes are now technically incapable of hitting the authentication error.
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

posts.get("/article/query/:id",authmiddleware, async (c) => {
  const primsa = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const postId = Number(c.req.param("id"));
  try {
    const findPost = await primsa.post.findFirst({
    where: { id: postId },
  });
  if(!findPost){  return c.json({ msg: "post not found" }, 404);}
  else {
  }
  } catch (error) {
    
  }
  
  
})

export default posts;

