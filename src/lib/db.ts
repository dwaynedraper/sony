import "server-only";
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "sony-toolkit";

type Globals = typeof globalThis & {
  __mongoClient?: MongoClient;
  __mongoClientPromise?: Promise<MongoClient>;
};

const g = globalThis as Globals;

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  }
  if (process.env.NODE_ENV === "development") {
    if (!g.__mongoClientPromise) {
      g.__mongoClient = new MongoClient(uri);
      g.__mongoClientPromise = g.__mongoClient.connect();
    }
    return g.__mongoClientPromise;
  }
  if (!g.__mongoClientPromise) {
    g.__mongoClient = new MongoClient(uri);
    g.__mongoClientPromise = g.__mongoClient.connect();
  }
  return g.__mongoClientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  // Use the DB name from environment, or fallback to dev for safety
  const dbName = process.env.MONGODB_DB || "sony_dev";
  return client.db(dbName);
}
