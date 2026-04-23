import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSession } from "@/lib/dal";

/**
 * Returns the current "Business Day" string in YYYY-MM-DD format.
 * The day rolls over at 2 AM PST.
 */
function getBusinessDay(): string {
  // Offset by 2 hours so that 00:00 - 01:59 is considered the previous day
  const date = new Date(Date.now() - 2 * 60 * 60 * 1000);
  return date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

export async function GET() {
  const session = await requireSession();
  const businessDay = getBusinessDay();

  const db = await getDb();
  const data = await db.collection("oosState").findOne({
    ownerId: session.userId,
    businessDay,
  });

  return NextResponse.json(data?.checked || {});
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const businessDay = getBusinessDay();
  const body = await req.json(); // Record<string, boolean>

  const db = await getDb();
  await db.collection("oosState").updateOne(
    { ownerId: session.userId, businessDay },
    {
      $set: {
        ownerId: session.userId,
        businessDay,
        checked: body,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
