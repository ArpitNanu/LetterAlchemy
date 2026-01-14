import { Hono } from "hono";
import { Env } from "./types/env";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("hono!"));

export default app;
