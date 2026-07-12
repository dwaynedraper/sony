/**
 * One-time DB setup for the store-number model.
 *
 *   npm run db:setup                                   # the DB in .env.local
 *   npm run db:setup -- --db sony-toolkit-prod         # a specific DB
 *   npm run db:setup -- --db sony-toolkit-prod --drop-legacy
 *
 * Dev and prod share one connection string and differ only by database name,
 * so --db is all you need to switch targets.
 *
 * Nothing here is a "migration" — the new collections are created on first
 * write anyway. This just adds the indexes that keep them honest, and can
 * clear out the dead login-era collections.
 *
 * Safe to run more than once.
 */
import { MongoClient } from "mongodb";

const args = process.argv.slice(2);
const dbFlagIdx = args.indexOf("--db");
const dbFromFlag = dbFlagIdx !== -1 ? args[dbFlagIdx + 1] : null;

const uri = process.env.MONGODB_URI;
const dbName = dbFromFlag || process.env.MONGODB_DB || "sony_dev";

if (!uri) {
  console.error("MONGODB_URI is not set. Run with: npm run db:setup");
  process.exit(1);
}
if (dbFlagIdx !== -1 && !dbFromFlag) {
  console.error("--db needs a database name, e.g. --db sony-toolkit-prod");
  process.exit(1);
}

/** Store-number-keyed collections. One document per store. */
const STORE_COLLECTIONS = ["tableStores", "tableLayouts", "tableStock", "tableIssues"];

/** Dead weight from the login era. */
const LEGACY = ["users", "loginTokens", "stores", "storeIssues", "oosState"];

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
console.log(`\n>>> TARGET DATABASE: "${dbName}"  <<<\n`);

// A store number is the identity, so it must be unique. Without this, two
// concurrent upserts can quietly race and create duplicate documents.
for (const name of STORE_COLLECTIONS) {
  await db.collection(name).createIndex({ number: 1 }, { unique: true });
  console.log(`  unique index on ${name}.number`);
}

// Rate-limit rows only matter for an hour — let Mongo expire them instead of
// growing forever. This also clears out the old userId-keyed rows.
await db.collection("aiUsage").createIndex({ timestamp: 1 }, { expireAfterSeconds: 7200 });
console.log("  TTL index on aiUsage.timestamp (2h)");

if (args.includes("--drop-legacy")) {
  console.log("");
  const existing = (await db.listCollections().toArray()).map((c) => c.name);
  for (const name of LEGACY) {
    if (existing.includes(name)) {
      await db.collection(name).drop();
      console.log(`  dropped legacy collection: ${name}`);
    } else {
      console.log(`  (${name} not present)`);
    }
  }
} else {
  console.log(`\nLegacy collections left alone. To remove them, re-run with --drop-legacy:\n  ${LEGACY.join(", ")}`);
}

await client.close();
console.log("\nDone.");
