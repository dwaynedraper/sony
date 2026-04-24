import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getSession } from "@/lib/dal";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { genre, item } = await req.json();

  if (!genre || !item) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Rate limiting check
  const db = await getDb();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const requestCount = await db.collection("aiUsage").countDocuments({
    userId: session.userId,
    timestamp: { $gt: oneHourAgo },
  });

  if (requestCount >= 50) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  await db.collection("aiUsage").insertOne({ userId: session.userId, timestamp: now });

  // ─── Cache Check ─────────────────────────────────────────────────────────
  const cacheKey = { genre: genre.toLowerCase(), item: item.toLowerCase() };
  const cached = await db.collection("basketRationales").findOne(cacheKey);
  
  if (cached) {
    return NextResponse.json({ rationale: cached.rationale });
  }

  // ─── Generate if not cached ──────────────────────────────────────────────
  const prompt = `You are a Sony camera sales expert. 
A customer is interested in ${genre} photography.
Explain in one short, punchy sentence why they need "${item}" for this specific genre.
Be persuasive but professional. Focus on how it solves a problem or enhances the result.
If it's an SD card or battery, mention reliability and not missing the moment.`;

  try {
    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-5.4-nano"),
      prompt,
      temperature: 0.7,
    });

    const rationale = text.trim();

    // Save to cache
    await db.collection("basketRationales").updateOne(
      cacheKey,
      { $set: { rationale, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ rationale });
  } catch (err) {

    console.error("AI Error:", err);
    return NextResponse.json({ error: "Failed to generate rationale" }, { status: 500 });
  }
}
