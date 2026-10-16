import { db } from "../db/index.js";
import { posts, users, likes, comments } from "../db/schema.js";
import { eq, sql, desc, like } from "drizzle-orm";

export async function createComment(postId, userId, content) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) {
    return null;
  }
  const [comment] = await db
    .insert(comments)
    .values({ postId, userId, content })
    .returning();

  return {
    id: comment.id,
    content: comment.content,
    created_at: comment.createdAt,
    username: user.username,
  };
}
