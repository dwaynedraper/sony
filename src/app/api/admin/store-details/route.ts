import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSession } from "@/lib/dal";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const ownerId = searchParams.get("ownerId");

  if (!storeId || !ownerId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const db = await getDb();
  const issues = await db.collection("storeIssues").findOne({
    storeId,
    ownerId,
  });

  return NextResponse.json(issues?.cameras || {});
}
