import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/stores/[number]
 * Everything a store owns, in one fetch: its layout override (if any),
 * out-of-stock marks, and display issues. `id` is the Best Buy store number.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const db = await getDb();

  const [store, layoutDoc, stockDoc, issuesDoc] = await Promise.all([
    db.collection("tableStores").findOne({ number: id }, { projection: { _id: 0 } }),
    db.collection("tableLayouts").findOne({ number: id }),
    db.collection("tableStock").findOne({ number: id }),
    db.collection("tableIssues").findOne({ number: id }),
  ]);

  return NextResponse.json({
    store: store ?? { number: id },
    layout: layoutDoc?.layout ?? null, // null = use the shipped default planogram
    stock: stockDoc?.stock ?? {},
    issues: issuesDoc?.issues ?? {},
  });
}
