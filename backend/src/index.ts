import { Hono } from "hono";
import { Env } from "./types/env";
import auth from "./routes/auth";
import posts from "./routes/posts";
import { authmiddleware } from "./middleware/auth.middleware";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("hono!"));
app.route("/api/v1", auth);
posts.use("*", authmiddleware);
app.route("/api/v1", posts);

export default app;
