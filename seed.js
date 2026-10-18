// seed.js — fills the database with demo data using drizzle-seed
// Install:  npm i drizzle-seed
// Run:      node seed.js
import bcrypt from "bcrypt";
import { seed, reset } from "drizzle-seed";
import { db, pool } from "./db/index.js";
import { users, posts, comments, likes } from "./db/schema.js";

// Pass ONLY the tables (not the `relation` export). drizzle-seed reads the
// foreign keys (posts.user_id → users.id, etc.) from the tables themselves.
const schema = { users, posts, comments, likes };

// likes is NOT given to drizzle-seed: its composite PK (post_id + user_id)
// made the generator produce duplicate pairs. We insert likes ourselves below.
const seededTables = { users, posts, comments };

// Dates for created_at: within the last 30 days (instead of random 2022-2026)
const maxDate = new Date();
const minDate = new Date(Date.now() - 30 * 86_400_000);

const DEMO_PASSWORD = "Password123!";

// Images that already exist in your uploads/ folder
const IMAGES = [
  "06c627a6-b509-4867-81f6-43da6d99d6e4.jpeg",
  "b0703765-c317-453e-9a55-145ef9809097.jpeg",
  "dc33a72b-1211-486a-804d-81c18481f810.jpg",
  "dc7fbbd1-a6cb-4331-9d6f-e687b43633cd.png",
  "f6a471ce-b48d-49c7-bd98-8fb3e62c2c47.png",
];

const NAMES = ["marwan", "menna", "ahmed", "laila", "omar", "nour", "youssef", "mona"];

const POSTS = [
  "Hello everyone! This is my first post on the class blog.",
  "Finally understood how JOINs work today. LEFT JOIN is my new best friend.",
  "Tip: never store plain-text passwords. Hash them with bcrypt before saving.",
  "Sunset from my balcony after a long day of debugging. Worth the break!",
  "Forgetting `await` returns a Promise, not the data. Learned that the hard way.",
  "Sessions are easier to revoke than JWTs because the server controls them.",
  "Drizzle migrations are so smooth: generate, migrate, and the tables are ready.",
  "Always validate what the client sends. Zod makes it really clean.",
  "Group project meeting tomorrow at 10am. Come with your part ready!",
  "Just deployed my first Express app. Seeing it live feels amazing.",
];

const COMMENTS = [
  "Great post!",
  "Totally agree with this.",
  "Thanks for sharing, very helpful.",
  "I learned this the hard way too.",
  "Nice one, keep them coming!",
  "Can you explain this a bit more?",
  "Welcome to the blog!",
  "This saved me a lot of time.",
  "See you there!",
  "Congrats, well done!",
];

async function main() {
  // bcrypt hash for login — the same hash is reused for every demo user
  const passwordhash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("🧹 Resetting tables...");
  await reset(db, schema);

  console.log("🌱 Seeding...");
  await seed(db, seededTables, { seed: 1 }).refine((f) => ({
    users: {
      count: NAMES.length,
      columns: {
        username: f.valuesFromArray({ values: NAMES, isUnique: true }),
        email: f.valuesFromArray({
          values: NAMES.map((n) => `${n}@example.com`),
          isUnique: true,
        }),
        passwordhash: f.valuesFromArray({ values: [passwordhash] }),
        createdAt: f.date({ minDate, maxDate }),
      },
    },
    posts: {
      count: 25,
      columns: {
        content: f.valuesFromArray({ values: POSTS }),
        createdAt: f.date({ minDate, maxDate }),
        // half of the posts get an image, the rest are text-only (null)
        images: f.weightedRandom([
          { weight: 0.5, value: f.valuesFromArray({ values: IMAGES }) },
          { weight: 0.5, value: f.default({ defaultValue: null }) },
        ]),
      },
    },
    comments: {
      count: 60,
      columns: {
        // comments.content is varchar(255) — keep these short
        content: f.valuesFromArray({ values: COMMENTS }),
        createdAt: f.date({ minDate, maxDate }),
      },
    },
  }));

  // ---------- LIKES (manual, guaranteed unique) ----------
  console.log(" Creating likes...");
  const allUsers = await db.select({ id: users.id }).from(users);
  const allPosts = await db.select({ id: posts.id }).from(posts);

  // every possible (post, user) pair — each one appears only once
  const pairs = allPosts.flatMap((p) =>
    allUsers.map((u) => ({ postId: p.id, userId: u.id })),
  );

  // shuffle (Fisher-Yates), then take the first 80 → no duplicates possible
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  await db.insert(likes).values(pairs.slice(0, 80));

  console.log(" Seed complete!");
  console.log(` Login with e.g. marwan@example.com / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());