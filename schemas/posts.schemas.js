import { createInsertSchema } from "drizzle-orm/zod";
import { posts } from "../db/schema.js";
import z from "zod";

export const insertPostSchema = createInsertSchema(posts, {
  content: z.string().min(1, "post content cannot be empty").max(5000),
}).omit({ id: true, userId: true, images: true, createdAt: true });
