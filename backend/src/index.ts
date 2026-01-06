import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as z from "zod";
import { resolveCallback } from "hono/utils/html";

export interface Env {
  DATABASE_URL: string;
}

const SignupSchema = z.object({
  email: z.string(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  bio: z.string().max(250).optional(),
  socialLinks: z.string().optional(),
});

const app = new Hono<{ Bindings: Env }>();

export const getPrisma = (env: Env) => {
  const adapter = new PrismaNeon({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
};

app.get("/", (c) => c.text("hono!"));

app.post("/api/v1/signup", async (c) => {
  try {
    const body = await c.req.json();

    const validInput = SignupSchema.safeParse(body);
    if (!validInput.success) return console.error("invalid user information");
    else {
      const email = validInput.data?.email;
      const prisma = getPrisma(c.env);
      const userExists = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (userExists) {
        return console.error("user already exists");
      } else {
        await prisma.user.create({
          data: {
            email: validInput.data?.email,
            firstName: validInput.data?.firstName,
            lastName: validInput.data?.lastName,
            bio: validInput.data?.bio,
            socialLinks: validInput.data?.socialLinks,
          },
        });
        return c.json({ msg: "User Created" });
      }
    }
  } catch (error) {
    console.error("oops something went wrong");
  } finally {
    console.log("signup reached to database");
  }
});

export default app;
