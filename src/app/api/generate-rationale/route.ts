import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';
import { getSession } from '@/lib/dal';
import { getDb } from '@/lib/db';

export const maxDuration = 30;

interface Answers {
  skill?: string;
  intent?: string;
  focus?: string;
  useCase?: string;
  formFactor?: string;
  mustHaves?: string[];
}

interface RankedCamera {
  camera: { sku: string; name: string };
  missingMustHaves?: string[];
}

interface EngineResults {
  best?: RankedCamera;
  alternatives?: RankedCamera[];
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Rate Limiting ───────────────────────────────────────────────────────
  const db = await getDb();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Count requests in the last hour for this user
  const requestCount = await db.collection("aiUsage").countDocuments({
    userId: session.userId,
    timestamp: { $gt: oneHourAgo },
  });

  if (requestCount >= 20) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again in an hour." },
      { status: 429 }
    );
  }

  // Record this request
  await db.collection("aiUsage").insertOne({
    userId: session.userId,
    timestamp: now,
  });

  // ─── Original Logic ──────────────────────────────────────────────────────
  const { answers, results } = (await req.json()) as {
    answers: Answers;
    results: EngineResults;
  };

  const prompt = `
You are an expert Sony Camera Representative. A customer has just completed a questionnaire to find their perfect camera.

CUSTOMER PROFILE:
- Skill Level: ${answers.skill}
- Intent (Hobby/Pro): ${answers.intent}
- Focus (Photo/Video): ${answers.focus}
- Core Genre: ${answers.useCase || 'N/A'}
- Desired Form Factor: ${answers.formFactor}
- Dealbreakers: ${answers.mustHaves?.join(', ') || 'None'}

RESULTS ENGINE OUTPUT:
The engine has selected the following cameras. Use their attached specification scores (1-10 scale), capabilities, and specific SKUs to inform your pitch.

### Best Match:
${JSON.stringify({ camera: results.best?.camera, missingMustHaves: results.best?.missingMustHaves }, null, 2)}

### Alternatives:
${JSON.stringify(results.alternatives?.map((a) => ({ camera: a.camera, missingMustHaves: a.missingMustHaves })), null, 2)}

YOUR TASK:
1. Speak like an inspiring, expert Sony Sales Representative. Translate the raw JSON data I have given you into powerful BENEFITS, not raw numbers. DO NOT output raw ratings like "8/10" or "specScores". Do not read SKUs aloud to them. 
2. Explain WHY the "Best Match" camera is perfect for them. Write a persuasive, highly personalized paragraph that takes about 30 seconds to read aloud. Directly connect their "Customer Profile" to the emotional and practical benefits of the camera (e.g. if their genre is sports, explain how the incredibly fast blackout-free shooting will ensure they never miss the decisive moment; if their intent is Pro, mention the peace of mind its reliability brings).
3. End the Best Match explanation with a clear, one-sentence tradeoff. IMPORTANT: If the 'missingMustHaves' array is not empty, you MUST explicitly state which requested features are missing in this tradeoff.
4. For each Alternative, write a punchy 2-sentence breakdown of what makes it a viable option and exactly what the tradeoff is. If the Alternative's 'missingMustHaves' array is not empty, you MUST state which requested features it misses in the tradeoff. You MUST include each Alternative's exact SKU in your JSON response so our system can map it correctly, but DO NOT talk about the SKU in the text itself.
`;

  const result = await streamObject({
    model: openai(process.env.OPENAI_MODEL || 'gpt-5.4-nano'),
    schema: z.object({
      bestReason: z.object({
        text: z.string().describe("A persuasive, inspiring 30-second conversational paragraph explaining the emotional and functional BENEFITS of this choice, explicitly avoiding raw stats/scores like '8/10'."),
        tradeoff: z.string().describe("A one sentence explanation of the main tradeoff for the Best Match.")
      }),
      alternatives: z.array(z.object({
        sku: z.string().describe("The exact SKU string of the alternative camera provided in the prompt."),
        text: z.string().describe("A brief 2-sentence explanation comparing the benefits of this alternative to the Best Match without using raw stats."),
        tradeoff: z.string().describe("The primary tradeoff of choosing this over the Best Match.")
      }))
    }),
    prompt,
    system: "You are an expert Sony representative assisting a customer.",
  });

  return result.toTextStreamResponse();
}
