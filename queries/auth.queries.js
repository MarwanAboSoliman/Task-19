import { users } from "../db/schema.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";

// 1. Register a new user
export async function registerUser({ username, email, password }) {
  const passwordhash = await bcrypt.hash(password, 10);

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new Error("email already in use");
  }

  const [user] = await db
    .insert(users)
    .values({ username, email, passwordhash })
    .returning();

  return user;
}
// 2- Login , Create Session

export async function loginUser({ email, password }) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new Error("Invalid Email or Password");
  }
  const isValid = await bcrypt.compare(password, user.passwordhash);
  if (!isValid) {
    throw new Error("Invalid Email or Password");
  }

  return { user };
}

//logout
// export async function logout(session_id) {
//   await db.delete(sessions).where(eq(sessions.sessionId, session_id));
//   return true;
// }

// export async function getUserBySession(session_id) {
//   const [session] = await db
//     .select({
//       id: users.id,
//       username: users.username,
//       email: users.email,
//     })
//     .from(sessions)
//     .innerJoin(users, eq(sessions.userId, users.id))
//     .where(
//       and(
//         eq(sessions.sessionId, session_id),
//         gt(sessions.expiresAt, new Date()),
//       ),
//     );
//   return session || null;
// }
