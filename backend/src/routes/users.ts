import { Hono } from "hono";
import { Env } from "../types/env";
import { getPrisma } from "../db/prisma";
import { authmiddleware } from "../middleware/auth.middleware";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
        avatar: true,
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
    
    // 3. Fetch Total Likes across all posts
    const totalLikes = await prisma.like.count({
      where: { post: { authorId: userId } },
    });

    // 4. Fetch Total Comments across all posts
    const totalComments = await prisma.comment.count({
      where: { post: { authorId: userId } },
    });

    return c.json({
      success: true,
      data: {
        profile: user,
        stats: {
          drafts: draftsCount,
          published: publishedCount,
          totalViews: totalViews,
          totalLikes: totalLikes,
          totalComments: totalComments,
        },
      },
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return c.json({ success: false, msg: "Internal Server Error" }, 500);
  }
});

// --- NEW UPLOAD ROUTES ---

// 1. Generate a Pre-signed URL for the frontend to upload directly to R2
users.post("/upload-url", async (c) => {
  const userId = c.get("userId");
  const { contentType, fileName } = await c.req.json();

  if (!contentType || !fileName) {
    return c.json({ success: false, msg: "Missing file info" }, 400);
  }

  // Create a unique key (filename) for the storage
  const key = `avatars/${userId}-${Date.now()}-${fileName.replace(/\s+/g, "_")}`;

  try {
    const s3 = new S3Client({
      region: "auto",
      endpoint: c.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: c.env.R2_ACCESS_KEY_ID,
        secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const command = new PutObjectCommand({
      Bucket: c.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // This URL expires in 60 seconds for security
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return c.json({
      success: true,
      uploadUrl,
      key,
      publicUrl: `${c.env.R2_PUBLIC_URL}/${key}`,
    });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    return c.json({ success: false, msg: "Failed to generate upload URL" }, 500);
  }
});

// 2. Save the final uploaded image URL to the database
users.post("/update-avatar", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const { avatarUrl } = await c.req.json();

  if (!avatarUrl) {
    return c.json({ success: false, msg: "Avatar URL is required" }, 400);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return c.json({
      success: true,
      message: "Avatar updated successfully",
      avatarUrl: updatedUser.avatar,
    });
  } catch (error) {
    console.error("Update Avatar Error:", error);
    return c.json({ success: false, msg: "Database update failed" }, 500);
  }
});

export default users;