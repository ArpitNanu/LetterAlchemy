import { Hono } from "hono";

import { SignupSchema, SignInSchema } from "../schemas/auth.schema";
import { getPrisma } from "../db/prisma";
import bcrypt from "bcryptjs";
import { Env } from "../types/env";
import { generateAccessToken } from "../utils/auth.utils";
import { use } from "hono/jsx";

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
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              bio: user.bio,
              socailLinks: user.socialLinks,
            },
          },
          201,
        );
      }
    }
  // --- 🎓 ARCHITECTURE LEARNING MOMENT: Error Unmasking ---
  // Previously, this catch block returned a generic 401 (Unauthorized).
  // 1. MASKING: Returning 401 for system crashes makes it look like a login issue.
  // 2. UNMASKING: Returning 500 + error.message allows us to see exactly what 
  //    failed in the cloud (e.g., DB connection or missing JWT_SECRET).
  // -------------------------------------------------------
  } catch (error: any) {
    console.error(error);
    return c.json({ error: "Internal Server Error", details: error.message }, 500);
  } finally {
    console.log("signup request finished");
  }
});
auth.post("/signin", async (c) => {
  try {
    const body = await c.req.json();
    const validInput = SignInSchema.safeParse(body);
    if (!validInput.success) {
      return c.json(
        {
          message: "enter valid username/password",
        },
        400,
      );
    } else {
      const prisma = getPrisma(c.env);
      const userData = await prisma.user.findUnique({
        where: {
          email: validInput.data.email,
        },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
        },
      });
      if (!userData) {
        return c.json(
          {
            message: "Invalid email or password",
          },
          401,
        );
      } else {
        const storeHash = userData.password;
        const match = await bcrypt.compare(validInput.data.password, storeHash);
        if (!match) {
          return c.json({ msg: "Password not matched" }, 401);
        } else {
          const token = await generateAccessToken(
            userData.id.toString(),
            userData.email,
            c.env.JWT_SECRET,
          );
          return c.json(
            {
              message: "logged in successfully",
              token: token,
              user: {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
              },
            },
            200,
          );
        }
      }
    }
  // --- 🎓 ARCHITECTURE LEARNING MOMENT: Status Code Specificity ---
  // We use 500 here to indicate a SERVER-SIDE failure, distinguishing it 
  // from a 401 which would mean the user's password was simply wrong.
  // -------------------------------------------------------
  } catch (error: any) {
    console.error(error);
    return c.json({ msg: "Internal Server Error", details: error.message }, 500);
  }
});

export default auth;
