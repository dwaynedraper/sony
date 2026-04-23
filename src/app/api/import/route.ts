import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSession } from "@/lib/dal";
import type { StoreInfo, StoreIssueData } from "@/lib/store-storage";

interface ImportPayload {
  stores: StoreInfo[];
  issues: Record<string, StoreIssueData>;
}

export async function POST(req: Request) {
  const session = await requireSession();
  const { stores, issues } = (await req.json()) as ImportPayload;

  const db = await getDb();
  const now = new Date();

  // 1. Import stores
  if (stores.length > 0) {
    const storeOps = stores.map((s) => ({
      updateOne: {
        filter: { ownerId: session.userId, id: s.id },
        update: {
          $set: {
            ...s,
            ownerId: session.userId,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    }));
    await db.collection("stores").bulkWrite(storeOps);
  }

  // 2. Import issues
  const issueKeys = Object.keys(issues);
  if (issueKeys.length > 0) {
    const issueOps = issueKeys.map((storeId) => ({
      updateOne: {
        filter: { ownerId: session.userId, storeId },
        update: {
          $set: {
            ownerId: session.userId,
            storeId,
            cameras: issues[storeId].cameras,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    }));
    await db.collection("storeIssues").bulkWrite(issueOps);
  }

  return NextResponse.json({ ok: true });
}
