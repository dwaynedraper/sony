/**
 * The recommendation engine.
 *
 * ─── The one idea ───────────────────────────────────────────────────────────
 * Camera choice is a CONSTRAINT problem, not a scoring problem.
 *
 * The old engine scored every camera against every question and kept them all in
 * the pool, so nothing was ever *impossible* — it just returned the least-bad
 * camera with total confidence. That's why odd combinations produced nonsense.
 *
 * This one eliminates first and ranks second. If nothing survives, it says so,
 * and names the constraint that's doing the blocking.
 *
 * ─── Two front-ends, one brain ──────────────────────────────────────────────
 * The wizard COMPILES its answers into Requirements. The spec filter lets a rep
 * build the same Requirements by hand. Both call `recommend()`. They cannot
 * disagree, because there is only one engine.
 *
 * There are no camera names in this file. Adding a camera never means editing it.
 */

import { cameras, type Camera } from "../data/cameras.ts";
import { genreById, type Requirement, type Genre } from "../data/genres.ts";

export interface FinderInput {
  /** Genre ids. Multiple = the camera must satisfy ALL of their musts. */
  genres: string[];
  /** Hard ceiling, USD. */
  budget?: number;
  /** Extra hard constraints — this is how the spec filter feeds the finder. */
  extra?: Requirement[];
}

export interface Ranked {
  camera: Camera;
  /** 0..1 — how much of the "strong" and "nice" wish-list it satisfies. */
  score: number;
  metStrong: Requirement[];
  missedStrong: Requirement[];
  metNice: Requirement[];
  overBudget: boolean;
}

export interface Blocker {
  requirement: Requirement;
  /** How many cameras this single rule is keeping out. */
  wouldUnlock: number;
}

export interface FinderResult {
  picks: Ranked[];
  /** Worth-the-money upgrade sitting just over budget. */
  stretch: Ranked | null;
  /** Non-empty only when NOTHING matched. */
  blockers: Blocker[];
  /** Plain-English things to relax, in priority order. */
  relax: string[];
  /** The hard requirements that were applied (for display). */
  applied: Requirement[];
  /** Cheapest camera that satisfies the requirements, ignoring budget. */
  minPriceToQualify: number | null;
}

const passes = (c: Camera, reqs: Requirement[]) => reqs.every((r) => r.test(c));

/** De-dupe requirements by key — two genres often demand the same thing. */
function mergeRequirements(...lists: Requirement[][]): Requirement[] {
  const out = new Map<string, Requirement>();
  for (const list of lists) for (const req of list) if (!out.has(req.key)) out.set(req.key, req);
  return [...out.values()];
}

/**
 * How far ABOVE the bar a camera sits, averaged across the numeric rules it met.
 *
 * Without this, clearing a bar and demolishing it score identically — so the
 * A9 III's 120fps counted for nothing against a `20+ fps` rule, and a cheaper
 * 30fps body won the tiebreak. Headroom is what makes a flagship read as a
 * flagship, without any camera being named anywhere.
 */
function headroom(c: Camera, reqs: Requirement[]): number {
  const numeric = reqs.filter(
    (r) => r.metric && r.target != null && r.ceiling != null && r.test(c)
  );
  if (numeric.length === 0) return 0;

  const values = numeric.map((r) => {
    const span = r.ceiling! - r.target!;
    if (span <= 0) return 0; // the bar IS the ceiling — no headroom to earn
    const over = r.metric!(c) - r.target!;
    return Math.min(1, Math.max(0, over / span));
  });
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function scoreCamera(c: Camera, strong: Requirement[], nice: Requirement[], overBudget: boolean): Ranked {
  const metStrong = strong.filter((r) => r.test(c));
  const missedStrong = strong.filter((r) => !r.test(c));
  const metNice = nice.filter((r) => r.test(c));

  const strongPart = strong.length ? metStrong.length / strong.length : 1;
  const nicePart = nice.length ? metNice.length / nice.length : 1;
  const headroomPart = headroom(c, strong);

  return {
    camera: c,
    // Meeting the requirements dominates. Headroom breaks ties between cameras
    // that both meet them. "Nice" is the last word.
    score: strongPart * 0.6 + headroomPart * 0.22 + nicePart * 0.18,
    metStrong,
    missedStrong,
    metNice,
    overBudget,
  };
}

/**
 * Equally-capable cameras are ranked CHEAPEST FIRST.
 *
 * This is deliberate. If two bodies both do everything the customer needs, the
 * honest recommendation is the one that costs less — and it stops the engine
 * reflexively pushing the flagship at everyone, which is what destroys a rep's
 * credibility on the floor.
 */
function rank(a: Ranked, b: Ranked): number {
  if (Math.abs(a.score - b.score) > 0.001) return b.score - a.score;
  return a.camera.msrp - b.camera.msrp;
}

export function recommend(input: FinderInput): FinderResult {
  const selected: Genre[] = input.genres.map(genreById).filter((g): g is Genre => !!g);

  const must = mergeRequirements(...selected.map((g) => g.must), input.extra ?? []);
  const strong = mergeRequirements(...selected.map((g) => g.strong));
  const nice = mergeRequirements(...selected.map((g) => g.nice));

  // 1. ELIMINATE. Requirements are gates, not penalties.
  const qualified = cameras.filter((c) => passes(c, must));

  // 2. Nothing qualifies at any price → the requirements themselves conflict.
  if (qualified.length === 0) {
    const blockers: Blocker[] = must
      .map((req) => {
        const others = must.filter((m) => m.key !== req.key);
        // How many cameras would appear if we dropped ONLY this rule?
        const wouldUnlock = cameras.filter((c) => passes(c, others)).length;
        return { requirement: req, wouldUnlock };
      })
      .filter((b) => b.wouldUnlock > 0)
      .sort((a, b) => b.wouldUnlock - a.wouldUnlock);

    const relax = blockers.length
      ? blockers.map(
          (b) => `Drop "${b.requirement.label}" and ${b.wouldUnlock} camera${b.wouldUnlock === 1 ? "" : "s"} open up.`
        )
      : ["These requirements can't be met together, even in pairs. Loosen at least two."];

    return { picks: [], stretch: null, blockers, relax, applied: must, minPriceToQualify: null };
  }

  const cheapestQualifying = Math.min(...qualified.map((c) => c.msrp));

  // 3. Apply budget — a separate gate, so we can tell budget-blocked apart from
  //    impossible. That distinction is the whole difference between "stretch a
  //    little" and "you can't have that".
  const budget = input.budget ?? Infinity;
  const inBudget = qualified.filter((c) => c.msrp <= budget);

  const ranked = qualified
    .map((c) => scoreCamera(c, strong, nice, c.msrp > budget))
    .sort(rank);

  // 4. Budget is the ONLY thing blocking.
  if (inBudget.length === 0) {
    const best = ranked[0];
    return {
      picks: [],
      stretch: best,
      blockers: [],
      relax: [
        `Nothing that does this comes in under $${budget.toLocaleString()}. The cheapest that qualifies is the ${
          ranked.reduce((a, b) => (a.camera.msrp <= b.camera.msrp ? a : b)).camera.name
        } at $${cheapestQualifying.toLocaleString()}.`,
      ],
      applied: must,
      minPriceToQualify: cheapestQualifying,
    };
  }

  const picks = ranked.filter((rk) => !rk.overBudget).slice(0, 3);
  const bestInBudget = picks[0];

  // 5. A stretch pick only earns its place if it's MEANINGFULLY better — not
  //    just more expensive. Otherwise we'd be upselling for the sake of it.
  const overBudgetOptions = ranked.filter((rk) => rk.overBudget);
  const candidate = overBudgetOptions[0];
  const stretch =
    candidate && bestInBudget && candidate.score > bestInBudget.score + 0.15 ? candidate : null;

  return {
    picks,
    stretch,
    blockers: [],
    relax: [],
    applied: must,
    minPriceToQualify: cheapestQualifying,
  };
}
