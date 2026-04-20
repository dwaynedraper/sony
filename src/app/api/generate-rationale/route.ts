import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { answers, results } = await req.json();

  const prompt = `
You are an expert Sony Camera Representative. A customer has just completed a questionnaire to find their perfect camera.
Your job is to write a short, punchy explanation detailing WHY each recommended camera fits them, AND explicitly point out its main tradeoff at the end.
Keep the tone professional, persuasive, and highly tailored to their specific answers.
Keep each explanation under 3 sentences. Be concise.

Customer Answers:
- Experience: ${answers.experience}
- Seriousness: ${answers.seriousness}
- Primary Use: ${answers.primaryUse}
- Genre: ${answers.genre || 'N/A'}
- Budget Tier: ${answers.budgetTier}
- Must Haves: ${answers.mustHaves?.join(', ') || 'None'}

Recommendations:
- Best Match: ${results.best?.camera.name || 'None'}
- Save Money: ${results.save?.camera.name || 'None'}
- Premium Upgrade: ${results.upgrade?.camera.name || 'None'}
`;

  const result = await streamObject({
    model: openai(process.env.OPENAI_MODEL || 'gpt-5.4-nano'),
    schema: z.object({
      bestReason: z.object({
        bullets: z.array(z.string()).describe("2-3 short, punchy bullet points highlighting why this camera matches their needs."),
        tradeoff: z.string().describe("A one sentence explanation of the main tradeoff.")
      }).optional(),
      saveReason: z.object({
        bullets: z.array(z.string()),
        tradeoff: z.string()
      }).optional(),
      upgradeReason: z.object({
        bullets: z.array(z.string()),
        tradeoff: z.string()
      }).optional()
    }),
    prompt,
    system: "You are an expert Sony representative assisting a customer.",
  });

  return result.toTextStreamResponse();
}
