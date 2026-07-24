/**
 * What each genre actually REQUIRES — objectively, once.
 *
 * This file replaces ~200 hand-tuned per-camera scores with ~50 rules. Add a
 * camera and it slots into every genre automatically, because the rules ask
 * questions about specs rather than looking up an opinion someone typed in.
 *
 * ─── The three tiers ────────────────────────────────────────────────────────
 * must    — cannot do this work without it. Fails = ELIMINATED. Not penalised,
 *           eliminated. This is what stops the engine confidently recommending
 *           a pocket camera to a wildlife shooter.
 * strong  — the difference between getting by and getting hired.
 * nice    — tiebreak only.
 *
 * Every rule carries a `why` in plain language, so the app can explain a pick
 * (and a rejection) in words a rep can say out loud on the floor.
 *
 * ─── DEAN: RED-LINE THIS ────────────────────────────────────────────────────
 * The thresholds are my best guess; the domain knowledge is yours. The two I'd
 * argue about most:
 *   - weddings: I made DUAL CARD SLOTS a `must`. Shooting a paid wedding on a
 *     single card is a career-ending risk. That eliminates the A7C II and every
 *     APS-C body. Defensible, but it's a strong call — tell me if it's wrong.
 *   - real estate: I made BRACKETING a `must`. No AEB, no HDR interiors.
 */

import type { Camera } from "./cameras";

export interface Requirement {
  key: string;
  /** Short, shown as a chip: "20+ fps burst" */
  label: string;
  /** Plain English, said out loud: "You can't freeze a receiver at 5fps." */
  why: string;
  test: (c: Camera) => boolean;

  /**
   * HEADROOM (numeric rules only).
   *
   * Pass/fail alone can't tell "clears the bar" from "obliterates it". The
   * A9 III's 120fps is the entire reason it exists, but against a `fps >= 20`
   * rule it scores exactly the same as a 20fps body — so a cheaper camera won
   * on the tiebreak. That was wrong.
   *
   * With these, a camera earns extra credit for how far ABOVE the bar it sits,
   * normalised against the best in the lineup.
   */
  metric?: (c: Camera) => number;
  /** The bar itself. */
  target?: number;
  /** Best in the current lineup — the point of diminishing returns. */
  ceiling?: number;
}

export interface Genre {
  id: string;
  label: string;
  blurb: string;
  must: Requirement[];
  strong: Requirement[];
  nice: Requirement[];
}

// ─── Reusable requirements ──────────────────────────────────────────────────
const r = (key: string, label: string, why: string, test: (c: Camera) => boolean): Requirement =>
  ({ key, label, why, test });

const INTERCHANGEABLE = r(
  "interchangeable", "Interchangeable lenses",
  "The lens does most of the work in this genre — a fixed lens caps what they can ever shoot.",
  (c) => c.mount === "e-mount"
);
const FULL_FRAME = r(
  "full-frame", "Full-frame sensor",
  "Bigger sensor, cleaner low light and more subject separation.",
  (c) => c.sensor === "full-frame"
);
const BRACKETING = r(
  "bracketing", "Exposure bracketing",
  "Bright windows and dark interiors in one frame — impossible without bracketing for HDR.",
  (c) => c.bracketing
);
const VARI_ANGLE = r(
  "vari-angle", "Flip-out screen",
  "They have to see themselves while recording. A fixed screen makes that guesswork.",
  (c) => c.screen === "vari-angle"
);
const MIC_IN = r(
  "mic-in", "Microphone input",
  "Bad audio kills a video faster than bad picture. The built-in mic isn't enough.",
  (c) => c.micIn
);
const HEADPHONES = r(
  "headphones", "Headphone jack",
  "If they can't monitor audio, they find out it was broken in the edit.",
  (c) => c.headphoneOut
);
const LOG = r(
  "log", "Log profile",
  "Flat log footage is what makes proper colour grading possible.",
  (c) => c.logProfile
);
const TEN_BIT = r(
  "10-bit", "10-bit colour",
  "8-bit falls apart the moment you grade it — banding in every sky.",
  (c) => c.bitDepth >= 10
);
const DUAL_SLOTS = r(
  "dual-slots", "Dual card slots",
  "A card fails and the day is gone. On paid work, the second slot isn't optional.",
  (c) => c.cardSlots >= 2
);
const SEALED = r(
  "sealed", "Weather sealing",
  "It will get rained on. It will get dusty.",
  (c) => c.weatherSealed
);
const EVF = r(
  "evf", "Electronic viewfinder",
  "Tracking a moving subject at arm's length on a screen doesn't work — and in bright sun you can't see the screen at all.",
  (c) => c.evf
);
const fps = (n: number): Requirement => ({
  ...r(`fps-${n}`, `${n}+ fps burst`,
    `Fast action happens between frames — under ${n}fps they'll miss the moment.`,
    (c) => c.fps >= n),
  metric: (c) => c.fps, target: n, ceiling: 120,
});
const mp = (n: number): Requirement => ({
  ...r(`mp-${n}`, `${n}MP+`,
    `Resolution to crop into, print big, or deliver detail a client will pixel-peep.`,
    (c) => c.mp >= n),
  metric: (c) => c.mp, target: n, ceiling: 67,
});
const ibis = (n: number): Requirement => ({
  ...r(`ibis-${n}`, `${n}+ stop stabilisation`,
    "Handheld at slow shutter speeds without a blurry frame.",
    (c) => c.ibisStops >= n),
  metric: (c) => c.ibisStops, target: n, ceiling: 8.5,
});
const k4 = (n: number): Requirement => ({
  ...r(`4k-${n}`, `4K ${n}p`,
    `${n >= 120 ? "Slow motion that still looks sharp." : "Smooth, modern-looking motion."}`,
    (c) => c.video4kFps >= n),
  metric: (c) => c.video4kFps, target: n, ceiling: 120,
});
const POCKETABLE = r(
  "pocketable", "Actually portable",
  "The best camera is the one they didn't leave at the hotel.",
  (c) => c.sensor !== "full-frame" || c.role === "compact"
);
/**
 * Big pixels = clean high ISO. Full-frame with a modest MP count.
 * The metric is inverse pixel density, so the 12MP A7S III scores far above a
 * 33MP body rather than merely tying with it — which is the whole reason the
 * A7S III exists.
 */
const CLEAN_HIGH_ISO: Requirement = {
  ...r("clean-iso", "Large pixels for low light",
    "Fewer, bigger pixels on a full-frame sensor is what gives you clean shadows at high ISO.",
    (c) => c.sensor === "full-frame" && c.mp <= 34),
  metric: (c) => (c.sensor === "full-frame" ? 100 / c.mp : 0),
  target: 100 / 34, // ~2.94
  ceiling: 100 / 12, // ~8.33 — the A7S III
};
const AI_AF = r(
  "ai-af", "AI subject tracking",
  "It locks onto the eye and simply doesn't let go. For anything that moves, this is the spec that matters most.",
  (c) => c.aiAf
);
/** Uses the `role` tag so no camera name ever appears in the engine. */
const CINEMA_BODY = r(
  "cinema-body", "Built as a cinema camera",
  "Passive cooling to record all day, XLR audio, and rigging points — a stills body just isn't built for it.",
  (c) => c.role === "cinema"
);

// ─── The genres ─────────────────────────────────────────────────────────────
export const genres: Genre[] = [
  {
    id: "sports",
    label: "Sports & Action",
    blurb: "Fast, unpredictable subjects. Burst rate and autofocus are everything.",
    must: [INTERCHANGEABLE, EVF, fps(10)],
    strong: [AI_AF, fps(20), SEALED],
    nice: [DUAL_SLOTS, mp(30)],
  },
  {
    id: "wildlife",
    label: "Wildlife & Birds",
    blurb: "Long lenses, sudden movement, and cropping hard.",
    must: [INTERCHANGEABLE, EVF, fps(10)],
    strong: [AI_AF, fps(20), mp(30), SEALED],
    nice: [DUAL_SLOTS],
  },
  {
    id: "real-estate",
    label: "Real Estate & Interiors",
    blurb: "Bright windows, dark rooms, dead-straight verticals. A tripod genre.",
    must: [INTERCHANGEABLE, BRACKETING],
    strong: [mp(30), VARI_ANGLE],
    nice: [SEALED, ibis(5)],
  },
  {
    id: "portraits",
    label: "Portraits & Headshots",
    blurb: "Subject separation and skin tone. Mostly a lens job — the body just needs to keep up.",
    must: [INTERCHANGEABLE],
    strong: [FULL_FRAME, mp(24)],
    nice: [ibis(5), DUAL_SLOTS],
  },
  {
    id: "weddings",
    label: "Weddings & Events",
    blurb: "One take, no reshoot, dark venues. Reliability is the spec that matters.",
    must: [INTERCHANGEABLE, EVF, DUAL_SLOTS, FULL_FRAME],
    strong: [ibis(5), TEN_BIT, CLEAN_HIGH_ISO, AI_AF],
    nice: [SEALED, k4(60), fps(10)],
  },
  {
    id: "landscape",
    label: "Landscape",
    blurb: "Detail, dynamic range, and weather that wants to kill your camera.",
    must: [INTERCHANGEABLE],
    strong: [mp(40), SEALED, BRACKETING],
    nice: [ibis(5)],
  },
  {
    id: "vlogging",
    label: "Vlogging & Content",
    blurb: "Talking to camera, often alone, often handheld.",
    must: [VARI_ANGLE, MIC_IN],
    strong: [k4(60), INTERCHANGEABLE],
    nice: [LOG, ibis(1)],
  },
  {
    id: "video",
    label: "Video & Cinema",
    blurb: "Footage that has to survive a grade and a client.",
    must: [LOG, TEN_BIT],
    strong: [k4(120), HEADPHONES, CINEMA_BODY],
    nice: [DUAL_SLOTS, FULL_FRAME],
  },
  {
    id: "product",
    label: "Product & Studio",
    blurb: "Tripod, controlled light, and a client zooming to 200%.",
    must: [INTERCHANGEABLE],
    strong: [mp(33), BRACKETING],
    nice: [VARI_ANGLE, DUAL_SLOTS],
  },
  {
    id: "macro",
    label: "Macro",
    blurb: "Tiny subjects, razor-thin focus, everything magnified — including shake.",
    must: [INTERCHANGEABLE],
    strong: [mp(33), ibis(5)],
    nice: [VARI_ANGLE, SEALED],
  },
  {
    id: "travel",
    label: "Travel",
    blurb: "Carried all day. Size and weight beat specs.",
    must: [],
    strong: [POCKETABLE, k4(30)],
    nice: [SEALED, ibis(5)],
  },
  {
    id: "astro",
    label: "Astro & Night",
    blurb: "Almost no light. Sensor size and pixel size are the whole game.",
    must: [INTERCHANGEABLE, FULL_FRAME],
    strong: [CLEAN_HIGH_ISO, ibis(5)],
    nice: [SEALED, BRACKETING],
  },
  {
    id: "family",
    label: "Family & Everyday",
    blurb: "Kids who won't sit still, and a parent who won't read a manual.",
    must: [],
    strong: [fps(10), VARI_ANGLE],
    nice: [INTERCHANGEABLE, ibis(1)],
  },
];

export const genreById = (id: string) => genres.find((g) => g.id === id);
