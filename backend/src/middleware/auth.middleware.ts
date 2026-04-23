// authMiddleware.ts
import { verify } from "hono/jwt";
import type { Env } from "../types/env";
import { MiddlewareHandler } from "hono";

export const authmiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: { userId: string };
}> = async (c, next) => {
  if (c.req.method === "OPTIONS") {
    return await next();
  }
  const authHeader = c.req.header("Authorization") || c.req.header("authorization") || c.req.raw.headers.get("Authorization");

  if (!authHeader) {
    return c.json({ msg: "no token received: header is missing" }, 401);
  }
  
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return c.json({ msg: "no token received: format should be 'Bearer <token>'" }, 401);
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = await verify(token, c.env.JWT_SECRET, "HS256"); 
    // this fucker ruined by day 

    if (typeof decoded.sub !== "string") {
      return c.json({ msg: "Invalid token payload" }, 401);
    }

    c.set("userId", decoded.sub);
    await next();
  } catch (e: any) {
    console.error("[auth] JWT verify failed:", e?.message || e);
    return c.json({ msg: "invalid token", reason: e?.message || String(e) }, 401);
  }
};