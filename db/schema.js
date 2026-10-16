import { defineRelations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordhash: varchar("passwordhash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text(),
  images: text("images"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: varchar("content", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});
export const likes = pgTable(
  "likes",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })],
);

export const relation = defineRelations(
  {
    users,
    // sessions,
    posts,
    comments,
    likes,
  },
  (r) => ({
    users: {
      // sessions: r.many.sessions({
      //   from: r.users.id,
      //   to: r.sessions.userId,
      // }),
      posts: r.many.posts({
        from: r.users.id,
        to: r.posts.userId,
      }),
      comments: r.many.comments({
        from: r.users.id,
        to: r.comments.userId,
      }),
      like: r.many.likes({
        from: r.users.id,
        to: r.likes.userId,
      }),
    },
    // sessions: {
    //   users: r.one.users({
    //     from: r.sessions.userId,
    //     to: r.users.id,
    //   }),
    // },

    posts: {
      users: r.one.users({
        from: r.posts.userId,
        to: r.users.id,
      }),
      comments: r.many.comments({
        from: r.posts.id,
        to: r.comments.postId,
      }),
      likes: r.many.likes({
        from: r.posts.id,
        to: r.likes.postId,
      }),
    },
    comments: {
      users: r.one.users({
        from: r.comments.userId,
        to: r.users.id,
      }),
      posts: r.one.posts({
        from: r.comments.postId,
        to: r.posts.id,
      }),
    },
    likes: {
      users: r.one.users({
        from: r.likes.userId,
        to: r.users.id,
      }),
      posts: r.one.posts({
        from: r.likes.postId,
        to: r.posts.id,
      }),
    },
  }),
);
