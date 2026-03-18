import * as z from "zod";

const LogInSchema = z.object({
  email: z.email(),
  password: z.string(),
});

const SignupSchema = z.object({
  email: z.email(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  bio: z.string(),
  socialLinks: z.string(),
});
