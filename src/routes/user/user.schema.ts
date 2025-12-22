import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

export const CreateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().nullable(),
  hashed_password: z.string().optional().nullable(),
  signInType: z.enum(["GOOGLE", "NORMAL"]).default("NORMAL"),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string().optional().nullable(),
  hashed_password: z.string().optional().nullable(),
  signInType: z.enum(["GOOGLE", "NORMAL"]).optional(),
});

export const LoginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// New schemas for other routes
export const RequestEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.number(),
});

export const GoogleAuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
});

export const GetUserDataQuerySchema = z.object({
  id: z.string().optional(),
  email: z.string().email().optional(),
});

export const EditUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phoneNumber: z.string().optional().nullable(),
  hashed_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;

export const { schemas: userSchema, $ref } = buildJsonSchemas(
  {
    CreateUserSchema,
    UpdateUserSchema,
    LoginUserSchema,
    RequestEmailSchema,
    VerifyOtpSchema,
    GoogleAuthSchema,
    GetUserDataQuerySchema,
    EditUserSchema,
  },
  { $id: "userSchema" }
);
