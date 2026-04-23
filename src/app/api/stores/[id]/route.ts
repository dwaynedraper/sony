import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSession } from "@/lib/dal";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await requireSession();
  const { id } = await params;

  const db = await getDb();
  
  // Delete the store
  await db.collection("stores").deleteOne({
    ownerId: session.userId,
    id: id,
  });

  // Delete associated issues
  await db.collection("storeIssues").deleteOne({
    ownerId: session.userId,
    storeId: id,
  });

  return NextResponse.json({ ok: true });
}
