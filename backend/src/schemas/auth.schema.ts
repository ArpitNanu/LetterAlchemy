import * as z from "zod";

export const SignupSchema = z.object({
  email: z.email(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  password: z.string(),
  bio: z.string().max(250).optional(),
  socialLinks: z.string().trim(),
});

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const PostSchema = z.object({
  title: z.string(),
  content: z.string(),
  authorId: z.number(),
});

export const CommentSchema = z.object({
  text: z.string(),
});

type SignInSchemaType = z.infer<typeof SignInSchema>;
type SchemaValidationType = z.infer<typeof SignupSchema>;
type SchemaPostType = z.infer<typeof PostSchema>;
type SchemacommentType = z.infer<typeof CommentSchema>;

export {
  SchemaValidationType,
  SignInSchemaType,
  SchemaPostType,
  SchemacommentType,
};
