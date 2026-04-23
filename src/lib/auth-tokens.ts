import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "./db";

const TOKEN_TTL_MINUTES = 15;

interface LoginTokenDoc {
  _id: ObjectId;
  userId: ObjectId;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
}

interface UserDoc {
  _id: ObjectId;
  email: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Idempotently ensure a user exists for the given email. Returns the user _id. */
async function upsertUser(email: string): Promise<ObjectId> {
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  const now = new Date();
  const res = await users.findOneAndUpdate(
    { email },
    { $setOnInsert: { email, createdAt: now } },
    { upsert: true, returnDocument: "after" }
  );
  if (!res) throw new Error("Failed to upsert user");
  return res._id;
}

/** Ensure indexes exist. Safe to call repeatedly — Mongo is a no-op on existing indexes. */
async function ensureIndexes(): Promise<void> {
  const db = await getDb();
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("loginTokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("loginTokens").createIndex({ tokenHash: 1 }, { unique: true });
}

/**
 * Create a login token for `email` and return the raw (unhashed) token.
 * Stored hash + TTL in Mongo. Token is valid for TOKEN_TTL_MINUTES.
 */
export async function issueLoginToken(email: string): Promise<string> {
  await ensureIndexes();
  const userId = await upsertUser(email);
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  const db = await getDb();
  await db.collection<LoginTokenDoc>("loginTokens").insertOne({
    _id: new ObjectId(),
    userId,
    tokenHash,
    expiresAt,
  });

  return rawToken;
}

/**
 * Consume a raw token. Returns { userId, email } on success, or null if invalid/expired/used.
 * Single-use: marks consumedAt atomically so a second call fails.
 */
export async function consumeLoginToken(
  rawToken: string
): Promise<{ userId: string; email: string } | null> {
  const tokenHash = hashToken(rawToken);
  const db = await getDb();

  const now = new Date();
  const tokenRes = await db.collection<LoginTokenDoc>("loginTokens").findOneAndUpdate(
    {
      tokenHash,
      expiresAt: { $gt: now },
      consumedAt: { $exists: false },
    },
    { $set: { consumedAt: now } },
    { returnDocument: "after" }
  );

  if (!tokenRes) return null;

  const user = await db
    .collection<UserDoc>("users")
    .findOneAndUpdate(
      { _id: tokenRes.userId },
      { $set: { lastLoginAt: now } },
      { returnDocument: "after" }
    );
  if (!user) return null;

  return { userId: user._id.toHexString(), email: user.email };
}
