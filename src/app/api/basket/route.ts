import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import { getDb } from "@/lib/db";

export const maxDuration = 30;

/**
 * Basket building is a REASONING task, not a writing task — knowing that real
 * estate needs a geared head and not just "a tripod" is domain judgment. A
 * nano/budget model pads and generalises here, which is the exact failure we're
 * fixing. So this route gets its own model knob and should point at a mid-tier
 * model, even though the Camera Finder pitch (pure prose) can stay cheap.
 *
 * At ~1.5k in / 800 out per basket, the difference is well under 2 cents.
 */
const BASKET_MODEL =
  process.env.OPENAI_MODEL_BASKET || process.env.OPENAI_MODEL || "gpt-5.4-nano";

/** No login — rate limit by client IP. */
function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

const basketSchema = z.object({
  summary: z
    .string()
    .describe("One short sentence reading who this customer is and what they're actually trying to do."),
  items: z.array(
    z.object({
      name: z
        .string()
        .describe("The product or product type, e.g. 'Sturdy tripod (aluminium or carbon)' or 'Insta360 X4'."),
      tier: z
        .enum(["essential", "do_it_right", "only_if"])
        .describe(
          "essential = cannot do the work without it. do_it_right = separates a paid-quality result from a hobby one. only_if = situational."
        ),
      why: z
        .string()
        .describe("One short sentence the rep can say out loud. Benefit-led. No spec dumps, no marketing fluff."),
      condition: z
        .string()
        .optional()
        .describe(
          "REQUIRED for only_if items. The trigger, phrased so the rep can ask the customer directly, e.g. 'they're offering virtual tours'."
        ),
    })
  ),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const db = await getDb();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const requestCount = await db.collection("aiUsage").countDocuments({ ip, timestamp: { $gt: oneHourAgo } });
  if (requestCount >= 50) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in an hour." }, { status: 429 });
  }
  await db.collection("aiUsage").insertOne({ ip, timestamp: now });

  const { gear, genres, needs } = (await req.json()) as {
    gear?: string;
    genres?: string;
    needs?: string;
  };

  if (!gear && !genres) {
    return NextResponse.json({ error: "Tell me what they bought or what they shoot." }, { status: 400 });
  }

  const prompt = `
THE CUSTOMER
- Just bought / already owns: ${gear || "not specified"}
- Shoots: ${genres || "not specified"}
- Special needs: ${needs || "none mentioned"}

Build their accessory basket.
`.trim();

  const result = streamObject({
    model: openai(BASKET_MODEL),
    schema: basketSchema,
    prompt,
    system: `You are a senior Sony camera specialist at Best Buy who actually shoots for a living. You build honest, realistic accessory baskets for customers.

HOW TO THINK
- Recommend only what the customer genuinely needs for the work they described. This is not a padded upsell list.
- Basket depth MUST match the genre. Some genres are simple, some are deep. A sports shooter may need nothing more than a telephoto lens, a monopod, and a fast card. A real estate shooter needs far more: a genuinely sturdy tripod, a 3-way geared head for perfectly level verticals, an ultra-wide (16-18mm, or a zoom that covers it), HDR/exposure-bracketing capability, a 360 camera for virtual tours, a phone gimbal for highlight walkthrough video.
- NEVER pad a tier to make it look complete. If a tier has nothing worth putting in it, return no items for that tier. Three right items beat eight wrong ones.
- Do NOT recommend something they already have. If they just bought a 24-70, don't sell them a 24-70.
- Non-Sony products are absolutely fine when they are the right tool (Insta360, Peak Design, SmallRig, Manfrotto, etc.). Recommend the right thing, not the Sony thing.
- Only recommend a memory card or battery when the genre actually demands it (a V90 card for 4K or bracketed bursts, spares for an all-day wedding). Don't reflexively tack them onto every basket.

THE TIERS
- "essential": they cannot do this work without it. Its absence means the camera they just bought underdelivers.
- "do_it_right": the difference between a hobby result and work somebody pays for. For real estate, a geared head lives here — you can shoot without it, but not sell without it.
- "only_if": situational. You MUST fill in "condition" with the trigger, phrased so the rep can ask the customer directly — "they're offering virtual tours", "they shoot indoors after dark". The condition is the most valuable part: it tells the rep which question to ask.

TONE
"why" is one short sentence a rep can say out loud on the floor. Lead with the benefit or the problem it solves. No spec dumps, no "elevate your photography" filler.`,
  });

  return result.toTextStreamResponse();
}
