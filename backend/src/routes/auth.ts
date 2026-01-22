import { Hono } from "hono";

import { SignupSchema, SignInSchema } from "../schemas/auth.schema";
import { getPrisma } from "../db/prisma";
import bcrypt from "bcryptjs";
import { Env } from "../types/env";
import { generateAccessToken } from "../utils/auth.utils";

const auth = new Hono<{ Bindings: Env }>();

auth.post("/signup", async (c) => {
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
        const hashedPassword = await bcrypt.hash(validInput.data.password, 10);
        const user = await prisma.user.create({
          data: {
            email: validInput.data.email,
            firstName: validInput.data.firstName,
            lastName: validInput.data.lastName,
            password: hashedPassword,
            bio: validInput.data.bio,
            socialLinks: validInput.data.socialLinks,
          },
        });
        const token = await generateAccessToken(
          user.id.toString(),
          user.email,
          c.env.JWT_SECRET,
        );
        return c.json(
          {
            msg: "new user signup successfully",
            Authorization: token,
          },
          201,
        );
      }
    }
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 401);
  } finally {
    console.log("signup request finished");
  }
});

auth.get("/signin", async (c) => {
  try {
    const body = await c.req.json();
    const validInput = SignInSchema.safeParse(body);
    if (!validInput.success) {
      return c.json(
        {
          message: "enter valid username/password",
        },
        401,
      );
    } else {
      const prisma = getPrisma(c.env);
      const userData = await prisma.user.findUnique({
        where: {
          email: validInput.data.email,
        },
      });
      if (!userData) {
        return c.json(
          {
            message: "No user exist",
          },
          404,
        );
      } else {
        const storeHash = userData.password;
        const match = await bcrypt.compare(validInput.data.password, storeHash);
        if (!match) {
          return c.json({ msg: "Password not matched" }, 401);
        } else {
          const token = generateAccessToken(
            userData.id.toString(),
            userData.email,
            c.env.JWT_SECRET,
          );
        }
      }
    }
  } catch (error) {
    console.error(error);
    return c.json({ msg: "incorrect input" }, 401);
  }
});

export default auth;
