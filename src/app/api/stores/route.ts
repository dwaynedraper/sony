import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * Stores are identified by their Best Buy store number. No auth, no location —
 * the toolkit is open and none of this data is sensitive. Everything a store
 * owns is namespaced by its number, so stores never collide.
 */

export async function GET() {
  const db = await getDb();
  const stores = await db
    .collection("tableStores")
    .find({}, { projection: { _id: 0, number: 1, nickname: 1 } })
    .sort({ number: 1 })
    .toArray();
  return NextResponse.json(stores);
}

export async function POST(req: Request) {
  const body = await req.json();
  const number = String(body?.number ?? "").trim();
  if (!number) {
    return NextResponse.json({ error: "Missing store number" }, { status: 400 });
  }

  const set: Record<string, unknown> = { number, updatedAt: new Date() };
  if (typeof body.nickname === "string") set.nickname = body.nickname;

  const db = await getDb();
  await db.collection("tableStores").updateOne({ number }, { $set: set }, { upsert: true });
  return NextResponse.json({ ok: true });
}
