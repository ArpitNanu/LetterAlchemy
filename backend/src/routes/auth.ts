import { Hono } from "hono";

import * as z from "zod";
import { getPrisma } from "../db/prisma";

import { Env } from "../types/env";

const auth = new Hono<{ Bindings: Env }>();

const SignupSchema = z.object({
  email: z.string(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  bio: z.string().max(250).optional(),
  socialLinks: z.string().optional(),
});

auth.post("/api/v1/signup", async (c) => {
  try {
    const body = await c.req.json();

    const validInput = SignupSchema.safeParse(body);
    if (!validInput.success) return console.error("invalid user information");
    else {
      const email = validInput.data.email;
      const prisma = getPrisma(c.env);
      const userExists = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (userExists) {
        return c.json({ error: "User already exists" }, 409);
      } else {
        await prisma.user.create({
          data: {
            email: validInput.data.email,
            firstName: validInput.data.firstName,
            lastName: validInput.data.lastName,
            bio: validInput.data.bio,
            socialLinks: validInput.data.socialLinks,
          },
        });
        return c.json({ msg: "User Created" }, 201);
      }
    }
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" });
  } finally {
    console.log("signup request finished");
  }
});
