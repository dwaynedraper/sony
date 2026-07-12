import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** PUT — save this store's custom layout (Edit Mode overrides). */
export async function PUT(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const layout = await req.json();

  const db = await getDb();
  await db.collection("tableLayouts").updateOne(
    { number: id },
    { $set: { number: id, layout, updatedAt: new Date() } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}

/** DELETE — drop the override and fall back to the shipped planogram. */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const db = await getDb();
  await db.collection("tableLayouts").deleteOne({ number: id });
  return NextResponse.json({ ok: true });
}
