import { Hono } from "hono";
import { Env } from "../types/env";
import { getPrisma } from "../db/prisma";
import { authmiddleware } from "../middleware/auth.middleware";

const users = new Hono<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>();

// Apply auth middleware to protect all user routes
users.use("*", authmiddleware);

users.get("/profile", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));

  try {
    // 1. Fetch User Info (Name, Bio, Social Links)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        socialLinks: true,
      },
    });

    if (!user) {
      return c.json({ success: false, msg: "User not found" }, 404);
    }

    // --- 🎓 ARCHITECTURE LEARNING MOMENT ---
    // Why use .count() and .aggregate() instead of Prisma relations (e.g. user.posts.length)?
    // 
    // 1. Performance (Memory Bloat): If a user has 2,000 posts, fetching them via relation 
    //    downloads 2,000 massive JSON objects into your Cloudflare Worker's 128MB RAM, which could crash it.
    // 
    // 2. Prisma Limitations: Prisma's relational `_count` doesn't let you split counts into multiple 
    //    conditions (like published vs unpublished) within a single nested `findUnique` query easily.
    // 
    // 3. The Senior Approach: .count() and .aggregate() translate into raw SQL 
    //    (e.g., SELECT COUNT(*) FROM post WHERE published = false). The database does the heavy math 
    //    and sends back a tiny 2-byte number across the network. Extremely fast and memory efficient!
    // ---------------------------------------

    // 2. Fetch Activity Imprint Stats
    const draftsCount = await prisma.post.count({
      where: { authorId: userId, published: false },
    });

    const publishedCount = await prisma.post.count({
      where: { authorId: userId, published: true },
    });

    const viewsAgg = await prisma.post.aggregate({
      where: { authorId: userId },
      _sum: { views: true },
    });
    
    const totalViews = viewsAgg._sum.views || 0;

    return c.json({
      success: true,
      data: {
        profile: user,
        stats: {
          drafts: draftsCount,
          published: publishedCount,
          totalViews: totalViews,
        },
      },
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return c.json({ success: false, msg: "Internal Server Error" }, 500);
  }
});

export default users;