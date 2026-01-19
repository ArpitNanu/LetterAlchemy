import { Hono } from "hono";
import { Env } from "./types/env";
import auth from "./routes/auth";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("hono!"));
app.route("/api/v1", auth);

export default app;
