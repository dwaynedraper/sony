import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireSession } from "@/lib/dal";

export async function GET() {
  const db = await getDb();
  
  // Fetch all stores and all issues
  const [stores, allIssues] = await Promise.all([
    db.collection("stores").find({}).toArray(),
    db.collection("storeIssues").find({}).toArray(),
  ]);

  // Combine them into a summary
  const summary = stores.map((store) => {
    const issuesDoc = allIssues.find(
      (i) => i.storeId === store.id && i.ownerId === store.ownerId
    );
    const cameras = issuesDoc?.cameras || {};
    
    // Count total issues
    const issueCount = Object.values(cameras).reduce((acc, issues: any) => {
      let count = 0;
      if (issues.alarm) count++;
      if (issues.noPower) count++;
      if (issues.broken) count++;
      if (issues.missing) count++;
      if (issues.other?.trim()) count++;
      return acc + count;
    }, 0);

    return {
      id: store.id,
      nickname: store.nickname,
      address: store.address,
      ownerId: store.ownerId,
      issueCount,
      updatedAt: issuesDoc?.updatedAt || store.updatedAt,
    };
  });

  // Sort by most recent updates
  summary.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json(summary);
}
