import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSession } from "@/lib/dal";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const session = await requireSession();
  const { id } = await params;

  const db = await getDb();
  const data = await db.collection("storeIssues").findOne({
    ownerId: session.userId,
    storeId: id,
  });

  return NextResponse.json(data?.cameras || {});
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await requireSession();
  const { id } = await params;
  const body = await req.json(); // Record<string, CameraIssues>

  const db = await getDb();
  await db.collection("storeIssues").updateOne(
    { ownerId: session.userId, storeId: id },
    {
      $set: {
        ownerId: session.userId,
        storeId: id,
        cameras: body,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
