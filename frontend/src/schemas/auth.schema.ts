import * as z from "zod";

export const LogInSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const SignupSchema = z.object({
  email: z.email(),
  password: z.string(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  bio: z.string().max(250).optional(),
  socialLinks: z.url().optional(),
});

type LogInSchemaType = z.infer<typeof LogInSchema>;
type SignupSchemaType = z.infer<typeof SignupSchema>;

export type { LogInSchemaType, SignupSchemaType };
