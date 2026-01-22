import * as z from "zod";

export const SignupSchema = z.object({
  email: z.string(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  password: z.string(),
  bio: z.string().max(250).optional(),
  socialLinks: z.string().optional(),
});

export const SignInSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});

export const PostSchema = z.object({
  title: z.string(),
  content: z.string(),
  authorId: z.number(),
});

type SignInSchemaType = z.infer<typeof SignInSchema>;
type SchemaValidationType = z.infer<typeof SignupSchema>;
type SchemaPostType = z.infer<typeof PostSchema>;

export { SchemaValidationType, SignInSchemaType, SchemaPostType };
