import { createInsertSchema } from "drizzle-orm/zod";
import { posts } from "../db/schema.js";
import z from "zod";

export const insertPostSchema = createInsertSchema(posts, {
  content: z
    .string()
    .min(1, "post content cannot be empty")
    .max(5000)
    .refine((val) => (val.match(/[a-zA-Z]/g) || []).length >= 2, {
      message: "post content must contain at least two alphabetic characters",
    }),
}).omit({ id: true, userId: true, images: true, createdAt: true });
