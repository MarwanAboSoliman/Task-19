import { db } from "../db/index.js";
import { posts, users, likes, comments } from "../db/schema.js";
import { eq, sql, desc, like } from "drizzle-orm";

// create post
export async function createPost({ userId, content, image }) {
  const [post] = await db
    .insert(posts)
    .values({ userId, content, images: image })
    .returning();
  return post;
}

// get all posts (enriched)
export async function getAllPosts(currentUserId) {
  return db
    .select({
      id: posts.id,
      content: posts.content,
      image: posts.images,
      created_at: posts.createdAt,
      username: users.username,
      like_count: sql`(select count(*)::int from ${likes} where ${likes.postId} = ${posts.id})`,
      comment_count: sql`(select count(*)::int from ${comments} where ${comments.postId} = ${posts.id})`,
      liked_by_me: sql`exists (select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${currentUserId})`,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));
}

// get one post enriched with its comments (for GET /api/posts/:id)
export async function getPostById(postId, currentUserId) {
  const [post] = await db
    .select({
      id: posts.id,
      content: posts.content,
      image: posts.images,
      created_at: posts.createdAt,
      username: users.username,
      like_count: sql`(select count(*)::int from ${likes} where ${likes.postId} = ${posts.id})`,
      comment_count: sql`(select count(*)::int from ${comments} where ${comments.postId} = ${posts.id})`,
      liked_by_me: sql`exists (select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${currentUserId})`,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, postId));

  if (!post) return null;

  const commentsList = await db
    .select({
      id: comments.id,
      content: comments.content,
      created_at: comments.createdAt,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId));

  return { post, comments: commentsList };
}

export async function toggleLike(postId, userId) {
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) {
    return null;
  }
  const [existLike] = await db
    .select()
    .from(likes)
    .where(eq(likes.postId, postId))
    .where(eq(likes.userId, userId));

  if (existLike) {
    //if there is like => unlike
    await db
      .delete(likes)
      .where(eq(likes.postId, postId))
      .where(eq(likes.userId, userId));
  } else {
    // add like
    await db.insert(likes).values({ postId, userId });
  }

  //update Count +1

  const [likeCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(likes)
    .where(eq(likes.postId, postId));

  return {
    liked: !existLike,
    like_count: likeCount.count,
  };
}
