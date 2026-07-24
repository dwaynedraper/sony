/**
 * THE camera dataset. One row per camera. Objective facts only.
 *
 * ─── The rule ───────────────────────────────────────────────────────────────
 * Nothing in here is a judgment call. No "speed: 7". No "genreScores". If a
 * value can be read off a spec sheet, it lives here; if it has to be *decided*,
 * it lives in the genre rules (src/data/genres.ts) or is derived at runtime.
 *
 * That's the whole point: adding a camera means adding its specs. It then slots
 * into every genre automatically, and correctly, forever. The old system made
 * you hand-tune ~200 numbers and they drifted out of reality immediately.
 *
 * ─── Provenance (read this) ─────────────────────────────────────────────────
 * VERIFIED — carried over from the curated spec-lookup data, plus web-checked
 *   for the A7 V and A7R VI:
 *     mp, sensor, fps, ibisStops, weatherSealed, video8kFps, video4kFps, bitDepth
 *
 * NEEDS DEAN'S EYES — I added these because the genre rules genuinely need them
 * and they did not exist anywhere in the old data. They're my best knowledge,
 * not spec-sheet reads. The ones I'm least sure of are marked `// ?`:
 *     msrp, mount, screen, micIn, headphoneOut, bracketing, logProfile, cardSlots
 *
 * `msrp` matters most — it's a HARD budget filter, so a wrong price produces a
 * wrong recommendation. You know these cold; correct this column first.
 */

export type Sensor = "full-frame" | "aps-c" | "1-inch";
export type Mount = "e-mount" | "fixed";
export type Screen = "vari-angle" | "tilt" | "fixed";

/**
 * Editorial role. The ONLY subjective field, and it exists to kill the
 * hardcoded camera names that used to sit in the engine ("FX3A" || "FX30 Body").
 * Adding a camera must never again require editing the engine.
 */
export type Role = "cinema" | "hybrid" | "resolution" | "speed" | "vlog" | "compact";

export interface Camera {
  id: string;
  name: string;
  sku: string;
  role: Role;
  /** USD, body only. VERIFY — prices move and this is a hard filter. */
  msrp: number;

  // ── Objective specs (verified) ────────────────────────────────────────────
  mp: number;
  sensor: Sensor;
  /** Max mechanical/electronic burst, fps. */
  fps: number;
  /** In-body stabilisation, stops. 0 = none. */
  ibisStops: number;
  weatherSealed: boolean;
  video8kFps: number; // 0 = no 8K
  video4kFps: number; // max 4K frame rate
  bitDepth: 8 | 10;

  // ── Capability flags (needed by the genre rules) ──────────────────────────
  mount: Mount;
  screen: Screen;
  micIn: boolean;
  headphoneOut: boolean;
  /** Auto exposure bracketing — the thing real estate lives or dies on. */
  bracketing: boolean;
  /** S-Log3 / picture profiles for grading. */
  logProfile: boolean;
  cardSlots: 1 | 2;
  /**
   * Dedicated AI processing unit — real subject recognition and tracking.
   * For sports and wildlife this is arguably THE spec, and it was missing from
   * every previous dataset. Without it the engine ranks an A6400 over an A6700
   * for sports purely because it's cheaper, which is wrong.
   */
  aiAf: boolean;
  /**
   * Electronic viewfinder. The FX cinema bodies and the ZV creator line have
   * none — you compose on the LCD. That's fine for video and hopeless for
   * tracking a receiver or shooting a wedding, so several genres require it.
   * This spec was missing everywhere, and its absence had the engine
   * recommending an FX2 (no viewfinder) to a wedding photographer.
   */
  evf: boolean;

  /** One line a rep can say out loud. */
  shortWhy: string;
}

export const cameras: Camera[] = [
  {
    id: "a1-ii", name: "A1 II", sku: "ILCE-1M2", role: "speed", msrp: 6499,
    mp: 50.1, sensor: "full-frame", fps: 30, ibisStops: 8.5, weatherSealed: true,
    video8kFps: 30, video4kFps: 120, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: true, evf: true,
    shortWhy: "The no-compromise flagship — 50MP at 30fps with 8K. It does everything.",
  },
  {
    id: "a9-iii", name: "A9 III", sku: "ILCE-9M3", role: "speed", msrp: 5999,
    mp: 24.6, sensor: "full-frame", fps: 120, ibisStops: 8.0, weatherSealed: true,
    video8kFps: 0, video4kFps: 120, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: true, evf: true,
    shortWhy: "120fps with zero distortion. Nothing else on earth catches a moment like it.",
  },
  {
    id: "a7r-vi", name: "A7R VI", sku: "ILCE-7RM6/B", role: "resolution", msrp: 4499,
    mp: 66.8, sensor: "full-frame", fps: 30, ibisStops: 8.5, weatherSealed: true,
    video8kFps: 30, video4kFps: 120, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: true, evf: true,
    shortWhy: "66MP stacked — resolution that used to cost you speed, and now doesn't.",
  },
  {
    id: "a7r-v", name: "A7R V", sku: "ILCE-7RM5/B", role: "resolution", msrp: 3899,
    mp: 61.0, sensor: "full-frame", fps: 10, ibisStops: 8.0, weatherSealed: true,
    video8kFps: 24, video4kFps: 60, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: true, evf: true,
    shortWhy: "61MP of detail you can crop into forever. The landscape and studio body.",
  },
  {
    id: "a7-v", name: "A7 V", sku: "ILCE-7M5/B", role: "hybrid", msrp: 2899,
    mp: 33.0, sensor: "full-frame", fps: 30, ibisStops: 7.5, weatherSealed: true,
    video8kFps: 0, video4kFps: 120, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: true, evf: true,
    shortWhy: "The do-everything body. 33MP, 30fps, 4K120 — very few reasons to buy anything else.",
  },
  {
    id: "a7-iv", name: "A7 IV", sku: "ILCE-7M4/B", role: "hybrid", msrp: 2499,
    mp: 33.0, sensor: "full-frame", fps: 10, ibisStops: 5.5, weatherSealed: true,
    video8kFps: 0, video4kFps: 60, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: false, evf: true, // ?
    shortWhy: "The hybrid everyone actually buys. 33MP stills, proper 10-bit video.",
  },
  {
    id: "a7c-ii", name: "A7C II", sku: "ILCE-7CM2/B", role: "compact", msrp: 2199,
    mp: 33.0, sensor: "full-frame", fps: 10, ibisStops: 7.0, weatherSealed: true,
    video8kFps: 0, video4kFps: 60, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true, // ?
    bracketing: true, logProfile: true, cardSlots: 1, aiAf: true, evf: true, // ?
    shortWhy: "Full-frame that actually fits in the bag. Same sensor as the A7 IV.",
  },
  {
    id: "a7-iii", name: "A7 III", sku: "ILCE-7M3/B", role: "hybrid", msrp: 1699,
    mp: 24.2, sensor: "full-frame", fps: 10, ibisStops: 5.0, weatherSealed: true,
    video8kFps: 0, video4kFps: 30, bitDepth: 8,
    mount: "e-mount", screen: "tilt", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: false, evf: true, // ?
    shortWhy: "The cheapest way into full-frame that a pro would still shoot.",
  },
  {
    id: "a7s-iii", name: "A7S III", sku: "ILCE-7SM3/B", role: "cinema", msrp: 3499,
    mp: 12.1, sensor: "full-frame", fps: 10, ibisStops: 5.5, weatherSealed: true,
    video8kFps: 0, video4kFps: 120, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: false, evf: true, // ?
    shortWhy: "It sees in the dark. 12MP is the point, not the problem.",
  },
  {
    id: "fx3", name: "FX3", sku: "ILME-FX3A", role: "cinema", msrp: 3899,
    mp: 12.1, sensor: "full-frame", fps: 10, ibisStops: 5.5, weatherSealed: true,
    video8kFps: 0, video4kFps: 120, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: false, evf: false, // ?
    shortWhy: "A cinema camera in a mirrorless body. Built to run all day, with XLR audio.",
  },
  {
    id: "fx2", name: "FX2", sku: "ILME-FX2B", role: "cinema", msrp: 2699,
    mp: 33.0, sensor: "full-frame", fps: 10, ibisStops: 5.0, weatherSealed: true,
    video8kFps: 0, video4kFps: 60, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: true, evf: false, // ?
    shortWhy: "The cinema line's way in — full-frame, XLR handle, 33MP when you need a still.",
  },
  {
    id: "fx30", name: "FX30", sku: "ILME-FX30B", role: "cinema", msrp: 1799,
    mp: 26.0, sensor: "aps-c", fps: 10, ibisStops: 5.5, weatherSealed: true,
    video8kFps: 0, video4kFps: 120, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 2, aiAf: false, evf: false, // ?
    shortWhy: "Cinema tools at APS-C money. The best first 'real' video camera Sony makes.",
  },
  {
    id: "a6700", name: "A6700", sku: "ILCE-6700/B", role: "hybrid", msrp: 1399,
    mp: 26.0, sensor: "aps-c", fps: 11, ibisStops: 5.0, weatherSealed: true,
    video8kFps: 0, video4kFps: 120, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 1, aiAf: true, evf: true,
    shortWhy: "The APS-C flagship. AI autofocus and 4K120 for well under full-frame money.",
  },
  {
    id: "a6400", name: "A6400", sku: "ILCE-6400/B", role: "hybrid", msrp: 899,
    mp: 24.2, sensor: "aps-c", fps: 11, ibisStops: 0, weatherSealed: true,
    video8kFps: 0, video4kFps: 30, bitDepth: 8,
    mount: "e-mount", screen: "tilt", micIn: true, headphoneOut: false,
    bracketing: true, logProfile: true, cardSlots: 1, aiAf: false, evf: true, // ?
    shortWhy: "The reliable everyday interchangeable-lens body. Still-brilliant autofocus.",
  },
  {
    id: "a6100", name: "A6100", sku: "ILCE-6100/B", role: "hybrid", msrp: 748,
    mp: 24.2, sensor: "aps-c", fps: 11, ibisStops: 0, weatherSealed: false,
    video8kFps: 0, video4kFps: 30, bitDepth: 8,
    mount: "e-mount", screen: "tilt", micIn: true, headphoneOut: false,
    bracketing: true, logProfile: false, cardSlots: 1, aiAf: false, evf: true, // ?
    shortWhy: "The cheapest real camera. A giant leap over a phone, and it grows with lenses.",
  },
  {
    id: "zv-e10-ii", name: "ZV-E10 II", sku: "ZVE10M2/B", role: "vlog", msrp: 999,
    mp: 26.0, sensor: "aps-c", fps: 11, ibisStops: 0, weatherSealed: false,
    video8kFps: 0, video4kFps: 60, bitDepth: 10,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 1, aiAf: true, evf: false, // ?
    shortWhy: "Built for creators — flip screen, real mic input, and you can change lenses.",
  },
  {
    id: "zv-e10", name: "ZV-E10", sku: "ZVE10/B", role: "vlog", msrp: 699,
    mp: 24.2, sensor: "aps-c", fps: 11, ibisStops: 0, weatherSealed: false,
    video8kFps: 0, video4kFps: 30, bitDepth: 8,
    mount: "e-mount", screen: "vari-angle", micIn: true, headphoneOut: true,
    bracketing: true, logProfile: true, cardSlots: 1, aiAf: false, evf: false, // ?
    shortWhy: "The starter creator camera with interchangeable lenses.",
  },
  {
    id: "zv-1-ii", name: "ZV-1 II", sku: "ZV1M2/B", role: "vlog", msrp: 899,
    mp: 20.1, sensor: "1-inch", fps: 24, ibisStops: 0, weatherSealed: false,
    video8kFps: 0, video4kFps: 30, bitDepth: 8,
    mount: "fixed", screen: "vari-angle", micIn: true, headphoneOut: false,
    bracketing: true, logProfile: false, cardSlots: 1, aiAf: false, evf: false, // ? // ? log
    shortWhy: "Wide 18mm lens so your arm fits in the frame. Pocket vlogging, done.",
  },
  {
    id: "zv-1", name: "ZV-1", sku: "DCZV1/B", role: "vlog", msrp: 749,
    mp: 20.1, sensor: "1-inch", fps: 24, ibisStops: 0, weatherSealed: false,
    video8kFps: 0, video4kFps: 30, bitDepth: 8,
    mount: "fixed", screen: "vari-angle", micIn: true, headphoneOut: false,
    bracketing: true, logProfile: false, cardSlots: 1, aiAf: false, evf: false, // ?
    shortWhy: "The original pocket creator camera. Fast lens, great for low light.",
  },
  {
    id: "zv-1f", name: "ZV-1F", sku: "ZV1F/B", role: "vlog", msrp: 499,
    mp: 20.1, sensor: "1-inch", fps: 16, ibisStops: 0, weatherSealed: false,
    video8kFps: 0, video4kFps: 30, bitDepth: 8,
    mount: "fixed", screen: "vari-angle", micIn: true, headphoneOut: false, // ? micIn
    bracketing: false, logProfile: false, cardSlots: 1, aiAf: false, evf: false, // ? // ? bracketing
    shortWhy: "Point it at your face and press record. The simplest way in.",
  },
  {
    id: "rx100-vii", name: "RX100 VII", sku: "DSC-RX100M7", role: "compact", msrp: 1299,
    mp: 20.1, sensor: "1-inch", fps: 20, ibisStops: 0, weatherSealed: false,
    video8kFps: 0, video4kFps: 30, bitDepth: 8,
    mount: "fixed", screen: "tilt", micIn: true, headphoneOut: false,
    bracketing: true, logProfile: true, cardSlots: 1, aiAf: false, evf: true, // ?
    shortWhy: "A 24-200mm zoom that fits in a jacket pocket. The travel camera.",
  },
];

export const cameraById = (id: string) => cameras.find((c) => c.id === id);
