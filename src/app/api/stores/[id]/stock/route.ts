import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** PUT — save this store's out-of-stock marks. */
export async function PUT(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const stock = await req.json();

  const db = await getDb();
  await db.collection("tableStock").updateOne(
    { number: id },
    { $set: { number: id, stock, updatedAt: new Date() } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
