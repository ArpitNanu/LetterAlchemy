import { Hono } from "hono";
import { Env } from "./types/env";
import auth from "./routes/auth";
import posts from "./routes/posts";
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

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const prisma = getPrisma(env);

    const niches = [
      {
        // add to different folder/file for cleaner code
        topic: "Tech",
        subreddit: "technology",
      },
      { topic: "Fiction", subreddit: "WritingPrompts" },
    ];
    const requests = niches.map((reddit) => {
      const jsonData = fetch(
        `https://www.reddit.com/r/${reddit.subreddit}/hot.json?limit=5`,
        {
          headers: {
            "User-agent":
              "LetterAlchemy/1.0 (Language=Typescript; contact=arpiverma.av@gmail.com)",
          },
        },
      );
      return jsonData;
    });
    const results = await Promise.allSettled(requests);
    const jsonData = results.map((res) => {
      if (res.status == "fulfilled") {
        return res.value.json();
      }
      return null;
    });

    const finalData: any[] = await Promise.all(jsonData);
    const headlineToSave = finalData
      .filter((res) => res && res.data && res.data.children)
      .flatMap((res) => res.data.children)
      .map((post) => ({
        url: `https://reddit.com${post.data.permalink}`,
        title: post.data.title,
        category: post.data.subreddit,
      }));
    //console.log(headlineToSave)

    if (headlineToSave.length > 0) {
      const createMany = await prisma.newsHeadline.createMany({
        data: headlineToSave,
        skipDuplicates: true,
      });
      console.log(createMany.count);
    }
    const pendingHeadLines = await prisma.newsHeadline.findMany({
      where: {
        text: null,
      },
      take: 10, // remember v8 heap memory we have save bcuz 128mb for free tier
      select: {
        title: true,
        id: true,
      },
    });
    // const aiGeneratedhealines =  pendingHeadLines.map((element) => {
    //   summarizeHeadline(element.title, env.GEMINI_API_KEY);
    // }); Resource Exhaustion
    for (const post of pendingHeadLines) {
      try {
        const summary = await summarizeHeadline(post.title, env.GEMINI_API_KEY);
        if (summary) {
          const writeSummary = await prisma.newsHeadline.update({
            where: {
              id: post.id,
            },
            data: {
              text: summary,
            },
            select: {
              text: true,
            },
          });
        }
      } catch (error) {
        console.error(`Failed to process ${post.id}`, error);
      }
    }
  },
};
