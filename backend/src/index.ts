import { Hono } from "hono";
import { Env } from "./types/env";
import auth from "./routes/auth";
import posts from "./routes/posts";
import promptAi from "./routes/promptAi";
import users from "./routes/users";
import comment from "./routes/comment";
import { authmiddleware } from "./middleware/auth.middleware";
import { ScheduledEvent, ExecutionContext } from "@cloudflare/workers-types";
import { getPrisma } from "./db/prisma";
import { summarizeHeadline } from "./services/gemini";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  async (c, next) => {
    const corsMiddleware = cors({
      origin: (origin) => {
        // Allow local development and the production frontend URL
        if (origin === "http://localhost:5173" || origin === c.env.FRONTEND_URL) {
          return origin;
        }
        // Fallback to production URL if origin is missing (rare)
        return c.env.FRONTEND_URL;
      },
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: ["Content-Length", "Authorization"],
      credentials: true,
    });
    return corsMiddleware(c, next);
  }
);

app.get("/", (c) => c.text("hono!"));

app.route("/api/v1", auth);
app.route("/api/v1", posts);
app.route("/api/v1/prompts", promptAi);
app.route("/api/v1/users", users);
app.route("/api/v1/comments", comment);

app.onError((err, c) => {
  console.error(`ERROR: ${err.message}`);
  return c.json(
    {
      success: false,
      message: "Something went wrong on our side",
      debug_info: err.message,
    },
    500,
  );
});

app.get("/dev/trigger-cron", async (c) => {
  // A handy endpoint to test your cron job manually!
  // We use waitUntil so it runs in the background and doesn't block the response
  c.executionCtx.waitUntil(processDailyHeadlines(c.env));
  return c.json({ success: true, message: "Headline processing started in the background" });
});

// --- ARCHITECTURE REFACTOR & CHANGELOG ---
// WHAT WE REMOVED: 
// The heavy logic previously sitting directly inside the `async scheduled()` export has been removed. 
// Having logic hardcoded inside the Cloudflare scheduled event makes it impossible to test manually.
//
// WHAT WE ADDED:
// 1. Extracted all logic into this standalone `processDailyHeadlines` function.
// 2. Added Hacker News API fetching alongside the existing Reddit fetching.
// 3. Merged both Reddit and HN data arrays together before passing them to Prisma.
// 4. Added a developer test endpoint (`/api/v1/trigger-cron`) above so you can trigger this via browser or curl.
// ------------------------------------------
async function processDailyHeadlines(env: Env) {
  const prisma = getPrisma(env);

  console.log("Starting daily headline fetch...");

  // Option A: Erase all headlines to start fresh (Uncomment to enable)
  // await prisma.newsHeadline.deleteMany({});
  // console.log("Erased old headlines.");

  const niches = [
    { topic: "Tech", subreddit: "technology" },
    { topic: "Fiction", subreddit: "WritingPrompts" },
  ];
  
  // 1. Fire off Reddit requests
  const redditRequests = niches.map((reddit) => 
    fetch(`https://www.reddit.com/r/${reddit.subreddit}/hot.json?limit=5`, {
      headers: { "User-agent": "LetterAlchemy/1.0 (contact=arpiverma.av@gmail.com)" },
    }).then(res => res.json())
  );

  // 2. Fire off Hacker News requests
  const hnResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  const hnIds = await hnResponse.json() as number[];
  const topHnIds = hnIds.slice(0, 5); // Just get top 5
  
  const hnRequests = topHnIds.map(id => 
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
  );

  // Wait for ALL fetches (Reddit and HN) to resolve
  const [redditDataRaw, hnDataRaw] = await Promise.all([
    Promise.allSettled(redditRequests),
    Promise.allSettled(hnRequests)
  ]);

  // 3. Format Reddit Data
  const redditHeadlines = redditDataRaw
    .filter((res: any) => res.status === "fulfilled")
    .map((res: any) => res.value)
    .filter((res) => res && res.data && res.data.children)
    .flatMap((res) => res.data.children)
    .map((post: any) => ({
      url: `https://reddit.com${post.data.permalink}`,
      title: post.data.title,
      category: post.data.subreddit,
    }));

  // 4. Format HN Data
  const hnHeadlines = hnDataRaw
    .filter((res: any) => res.status === "fulfilled")
    .map((res: any) => res.value)
    .map((item: any) => ({
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      title: item.title,
      category: "HackerNews",
    }));

  // Merge them together
  const allHeadlines = [...redditHeadlines, ...hnHeadlines];

  // 5. Save to DB
  if (allHeadlines.length > 0) {
    const createMany = await prisma.newsHeadline.createMany({
      data: allHeadlines,
      skipDuplicates: true,
    });
    console.log(`Saved ${createMany.count} new headlines`);
  }

  // 6. AI Summarization Phase
  const pendingHeadLines = await prisma.newsHeadline.findMany({
    where: { text: null },
    take: 20, //
  });

  for (const post of pendingHeadLines) {
    try {
      const summary = await summarizeHeadline(post.title, env.GEMINI_API_KEY);
      if (summary) {
        await prisma.newsHeadline.update({
          where: { id: post.id },
          data: { text: summary },
        });
      }
    } catch (error) {
      console.error(`Failed to process ${post.id}`, error);
    }
  }
  
  console.log("Finished processing headlines.");
}

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Now our cron job is perfectly clean!
    await processDailyHeadlines(env);
  },
};
