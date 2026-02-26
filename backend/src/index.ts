import { Hono } from "hono";
import { Env } from "./types/env";
import auth from "./routes/auth";
import posts from "./routes/posts";
import { authmiddleware } from "./middleware/auth.middleware";
import { ScheduledEvent, ExecutionContext } from "@cloudflare/workers-types";
import { promise } from "zod";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("hono!"));

posts.use("*", authmiddleware);

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
    const niches = [
      {
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
    const results = await Promise.allSettled(requests).then((responses) => {
      responses.map((item) => {
        if (item.status == "fulfilled") {
          item.value.json().then((data: any) => {
            console.log(data.data?.subreddit);
          });
        }
      });
    });
  },
};
