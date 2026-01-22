import { verify } from "hono/jwt";

import type { Env } from "../types/env";
import { MiddlewareHandler } from "hono";

export const authmiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}> = async (c, next) => {
  const authheader = c.req.header("Authorization");

  if (!authheader || !authheader.startsWith("Bearer ")) {
    return c.json({ msg: "no authorization" }, 401);
  } else {
    const tokenToVerify = authheader.split(" ")[1];

    const decodePayload = await verify(tokenToVerify, c.env.JWT_SECRET);
    if (typeof decodePayload.sub !== "string") {
      return c.json(
        {
          msg: "Invalid token payload",
        },
        401,
      );
    } else {
      c.set("userId", decodePayload.sub);
    }
  }
  await next();
};
