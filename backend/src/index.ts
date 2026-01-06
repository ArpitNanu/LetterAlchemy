import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { PrismaNeon } from "@prisma/adapter-neon";

export interface Env {
  DATABASE_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

export const getPrisma = (env: Env) => {
  const adapter = new PrismaNeon({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
};

app.get("/", (c) => c.text("hono!"));

app.post("/signup", async (c) => {
  const body = await c.req.json();
  const prisma = getPrisma(c.env);
  await prisma.user.create({
    data: {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      bio: body.bio,
      socialLinks: body.socialLinks,
    },
  });
  return c.json({ msg: "User Created" });
});

export default app;
