import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSession } from "@/lib/dal";
import { ObjectId } from "mongodb";
import type { StoreInfo } from "@/lib/store-storage";

export async function GET() {
  const session = await requireSession();
  const db = await getDb();
  const stores = await db
    .collection("stores")
    .find({ ownerId: session.userId })
    .sort({ createdAt: 1 })
    .toArray();

  return NextResponse.json(stores);
}

export async function POST(req: Request) {
  const session = await requireSession();
  const body = await req.json();
  const { id, nickname, address, lat, lng } = body;

  if (!id) {
    return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
  }

  const db = await getDb();
  const now = new Date();

  const store: Partial<StoreInfo> & { ownerId: string; createdAt: Date; updatedAt: Date } = {
    ownerId: session.userId,
    id,
    nickname,
    address,
    lat,
    lng,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("stores").updateOne(
    { ownerId: session.userId, id },
    { $set: store },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
