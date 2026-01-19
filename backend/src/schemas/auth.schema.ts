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
type SignInSchemaType = z.infer<typeof SignInSchema>;
type SchemaValidationType = z.infer<typeof SignupSchema>;

export { SchemaValidationType, SignInSchemaType };
