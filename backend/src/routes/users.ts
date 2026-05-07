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
    // Fire all database queries simultaneously using Promise.all
    // Since userId is already authenticated, we can fetch stats alongside the user profile
    const [
      user,
      draftsCount,
      publishedCount,
      viewsAgg,
      totalLikes,
      totalComments
    ] = await Promise.all([
      // 1. Fetch User Info (Name, Bio, Social Links)
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          bio: true,
          socialLinks: true,
          avatar: true,
        },
      }),
      // 2. Count Drafts
      prisma.post.count({
        where: { authorId: userId, published: false },
      }),
      // 3. Count Published Posts
      prisma.post.count({
        where: { authorId: userId, published: true },
      }),
      // 4. Sum Total Views
      prisma.post.aggregate({
        where: { authorId: userId },
        _sum: { views: true },
      }),
      // 5. Fetch Total Likes across all posts
      prisma.like.count({
        where: { post: { authorId: userId } },
      }),
      // 6. Fetch Total Comments across all posts
      prisma.comment.count({
        where: { post: { authorId: userId } },
      })
    ]);

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

    const totalViews = viewsAgg._sum.views || 0;

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
    // unhoistableHeaders: tells the presigner to NOT embed checksum headers
    // into the signed URL query params. AWS SDK v3 auto-adds x-amz-checksum-crc32
    // by default, but R2 rejects presigned requests with unsigned extra headers.
    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
      unhoistableHeaders: new Set([
        "x-amz-checksum-crc32",
        "x-amz-sdk-checksum-algorithm",
      ]),
    });

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

// 3. Partially update user profile (bio, links, etc.)
users.patch("/update-profile", async (c) => {
  const prisma = getPrisma(c.env);
  const userId = Number(c.get("userId"));
  const body = await c.req.json();

  // Only pick allowed fields — never blindly pass the whole body to Prisma
  const allowedUpdates: { bio?: string } = {};
  if (typeof body.bio === "string") allowedUpdates.bio = body.bio;

  if (Object.keys(allowedUpdates).length === 0) {
    return c.json({ success: false, msg: "No valid fields to update" }, 400);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: allowedUpdates,
      select: { bio: true },
    });

    return c.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return c.json({ success: false, msg: "Database update failed" }, 500);
  }
});

export default users;