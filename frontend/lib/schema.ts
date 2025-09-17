import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(4, "First name need to be at least characters"),
    lastName: z.string().optional(),
    confirmPassword: z.string().min(6, { message: "Password is too short" }),
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    {
      message: "Passwords must match!",
      path: ["confirmPassword"],
    }
  );

// Accept File in browser, string (public id) on server revalidation
const fileSchema = z.any().refine(
  (val) => {
    if (typeof window === "undefined") {
      // server side: allow string (already uploaded) or undefined (handled in controller)
      return (
        typeof val === "string" || val instanceof Buffer || val === undefined
      );
    }
    return val instanceof File;
  },
  { message: "A thumbnail file is required" }
);

export const createEventSchema = z.object({
  title: z
    .string()
    .min(2, "Event name must be at least 2 characters")
    .max(100, "Event name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Category is required"),
  thumbnail: fileSchema,
  eventDate: z.preprocess(
    (val) =>
      typeof val === "string" || val instanceof Date ? new Date(val) : val,
    z.date({
      required_error: "Event date is required",
      invalid_type_error: "Please select a valid date",
    })
  ),
});

export const createPostSchema = z
  .object({
    content: z
      .string()
      .min(1, "Say something about your post")
      .max(2000, "Post content is too long"),
    imageFile: z
      .instanceof(File)
      .refine((f) => f.size <= 5_000_000, "Image must be <= 5MB")
      .refine((f) => f.type.startsWith("image/"), "File must be an image")
      .optional(),
  })
  .refine((v) => !!v.imageFile, {
    message: "Provide an image ",
    path: ["imageFile"],
  });

export type CreatePostFormData = z.infer<typeof createPostSchema>;

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
