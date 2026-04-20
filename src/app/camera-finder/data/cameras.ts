export type Focus = "video" | "hybrid" | "photo";
export type Skill = "beginner" | "advanced";
export type Intent = "fun" | "work" | "pro";
export type Budget = "entry" | "mid" | "premium" | "no_limit";
export type FormFactor = "pocketable" | "compact" | "any";
export type UseCase =
  | "cinema_commercial"
  | "content_vlogging"
  | "family_video"
  | "weddings_events_video"
  | "documentary_run_gun"
  | "portraits_headshots"
  | "real_estate_arch"
  | "action_sports_photo"
  | "product_photo"
  | "lifestyle_photo"
  | "landscape_wildlife"
  | "all_rounder"
  | "travel"
  | "vlogging"
  | "portrait"
  | "sports"
  | "cinema";
export type MustHave =
  | "full_frame"
  | "ibis"
  | "evf"
  | "built_in_flash"
  | "log_profiles"
  | "interchangeable_lenses"
  | "high_burst"
  | "strong_low_light"
  | "high_resolution";

export type CameraModel = {
  name: string;
  sku: string;
  tier: Budget;
  focusBias: Focus;
  focusScores?: Record<Focus, number>;
  beginnerFriendly?: number;
  genreScores?: Partial<Record<UseCase, number>>;
  specScores?: {
    resolution: number;
    speed: number;
    lowLight: number;
    cinemaTools: number;
    portability: number;
    bokeh: number;
  };
  formFactor: FormFactor;
  useCases: UseCase[];
  skillFit: Skill[];
  intentFit: Intent[];
  mustHaves: MustHave[];
  shortWhy: string;
};

export const cameras: CameraModel[] = [
  {
    name: "ZV-1F",
    sku: "ZV1F/B",
    tier: "entry",
    focusBias: "video",
    focusScores: { video: 10, hybrid: 5, photo: 3 },
    beginnerFriendly: 10,
    specScores: { resolution: 3, speed: 4, lowLight: 4, cinemaTools: 4, portability: 10, bokeh: 3 },
    genreScores: { content_vlogging: 10, family_video: 9, travel: 9 },
    formFactor: "pocketable",
    useCases: ["vlogging", "travel"],
    skillFit: ["beginner"],
    intentFit: ["fun", "work"],
    mustHaves: ["built_in_flash"],
    shortWhy: "Easy pocket vlogging and quick social video.",
  },
  {
    name: "ZV-1",
    sku: "DCZV1/B",
    tier: "entry",
    focusBias: "video",
    focusScores: { video: 10, hybrid: 6, photo: 4 },
    beginnerFriendly: 10,
    specScores: { resolution: 5, speed: 6, lowLight: 7, cinemaTools: 5, portability: 10, bokeh: 5 },
    genreScores: { content_vlogging: 10, family_video: 8, travel: 9 },
    formFactor: "pocketable",
    useCases: ["vlogging", "travel"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["fun", "work"],
    mustHaves: ["built_in_flash"],
    shortWhy: "Pocket creator camera with stronger stills flexibility than ZV-1F.",
  },
  {
    name: "ZV-1 II",
    sku: "ZV1M2/B",
    tier: "entry",
    focusBias: "video",
    focusScores: { video: 10, hybrid: 6, photo: 4 },
    beginnerFriendly: 10,
    specScores: { resolution: 5, speed: 6, lowLight: 7, cinemaTools: 5, portability: 10, bokeh: 5 },
    genreScores: { content_vlogging: 10, family_video: 8, travel: 9 },
    formFactor: "pocketable",
    useCases: ["vlogging", "travel"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["fun", "work"],
    mustHaves: ["built_in_flash"],
    shortWhy: "Wider pocket vlog framing with simple controls.",
  },
  {
    name: "ZV-E10",
    sku: "ZVE10/B",
    tier: "entry",
    focusBias: "video",
    focusScores: { video: 9, hybrid: 7, photo: 5 },
    beginnerFriendly: 8,
    specScores: { resolution: 5, speed: 6, lowLight: 6, cinemaTools: 7, portability: 8, bokeh: 6 },
    genreScores: { content_vlogging: 9, documentary_run_gun: 8, family_video: 7 },
    formFactor: "compact",
    useCases: ["vlogging", "travel", "all_rounder"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["fun", "work"],
    mustHaves: ["interchangeable_lenses", "log_profiles"],
    shortWhy: "Budget-friendly creator body with lens flexibility.",
  },
  {
    name: "ZV-E10 II",
    sku: "ZVE10M2/B",
    tier: "mid",
    focusBias: "video",
    focusScores: { video: 9, hybrid: 7, photo: 5 },
    beginnerFriendly: 8,
    specScores: { resolution: 6, speed: 7, lowLight: 7, cinemaTools: 8, portability: 8, bokeh: 6 },
    genreScores: { content_vlogging: 9, documentary_run_gun: 8, weddings_events_video: 7 },
    formFactor: "compact",
    useCases: ["vlogging", "travel", "all_rounder"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["fun", "work", "pro"],
    mustHaves: ["interchangeable_lenses", "log_profiles"],
    shortWhy: "More capable video-first APS-C creator option.",
  },
  {
    name: "FX2",
    sku: "ILME-FX2B",
    tier: "premium",
    focusBias: "hybrid",
    focusScores: { video: 7, hybrid: 8, photo: 6 },
    beginnerFriendly: 3,
    specScores: { resolution: 7, speed: 8, lowLight: 7, cinemaTools: 7, portability: 6, bokeh: 7 },
    genreScores: { all_rounder: 8, weddings_events_video: 8, documentary_run_gun: 7, portraits_headshots: 7 },
    formFactor: "any",
    useCases: ["all_rounder", "cinema", "portrait", "travel"],
    skillFit: ["advanced"],
    intentFit: ["work", "pro"],
    mustHaves: ["full_frame", "ibis", "evf", "log_profiles", "interchangeable_lenses", "high_resolution"],
    shortWhy: "Hybrid full-frame body with strong video tools plus higher-resolution stills flexibility.",
  },
  {
    name: "FX3A",
    sku: "ILME-FX3A",
    tier: "premium",
    focusBias: "video",
    focusScores: { video: 10, hybrid: 4, photo: 2 },
    beginnerFriendly: 3,
    specScores: { resolution: 3, speed: 8, lowLight: 9, cinemaTools: 10, portability: 6, bokeh: 7 },
    genreScores: { cinema_commercial: 10, documentary_run_gun: 9, weddings_events_video: 9 },
    formFactor: "any",
    useCases: ["cinema"],
    skillFit: ["advanced"],
    intentFit: ["pro"],
    mustHaves: ["full_frame", "ibis", "log_profiles", "interchangeable_lenses", "strong_low_light"],
    shortWhy: "Serious full-frame cinema body for production work.",
  },
  {
    name: "FX30 Body",
    sku: "ILME-FX30B",
    tier: "mid",
    focusBias: "video",
    focusScores: { video: 10, hybrid: 3, photo: 2 },
    beginnerFriendly: 3,
    specScores: { resolution: 4, speed: 8, lowLight: 7, cinemaTools: 10, portability: 6, bokeh: 6 },
    genreScores: { cinema_commercial: 10, documentary_run_gun: 9, content_vlogging: 7 },
    formFactor: "any",
    useCases: ["cinema", "all_rounder"],
    skillFit: ["advanced"],
    intentFit: ["work", "pro"],
    mustHaves: ["log_profiles", "interchangeable_lenses"],
    shortWhy: "Affordable entry into Sony cinema style workflow.",
  },
  {
    name: "A7S III",
    sku: "ILCE-7SM3",
    tier: "premium",
    focusBias: "video",
    focusScores: { video: 10, hybrid: 7, photo: 6 },
    beginnerFriendly: 4,
    specScores: { resolution: 5, speed: 9, lowLight: 10, cinemaTools: 9, portability: 6, bokeh: 8 },
    genreScores: { cinema_commercial: 9, weddings_events_video: 10, documentary_run_gun: 9 },
    formFactor: "any",
    useCases: ["cinema", "all_rounder"],
    skillFit: ["advanced"],
    intentFit: ["work", "pro"],
    mustHaves: ["full_frame", "ibis", "evf", "log_profiles", "interchangeable_lenses", "strong_low_light"],
    shortWhy: "Best low-light hybrid leaning heavily toward video.",
  },
  {
    name: "A7R V",
    sku: "ILCE-7RM5",
    tier: "premium",
    focusBias: "photo",
    focusScores: { video: 3, hybrid: 6, photo: 10 },
    beginnerFriendly: 4,
    specScores: { resolution: 10, speed: 8, lowLight: 7, cinemaTools: 5, portability: 5, bokeh: 9 },
    genreScores: { portraits_headshots: 10, real_estate_arch: 10, product_photo: 10, landscape_wildlife: 9 },
    formFactor: "any",
    useCases: ["portrait", "travel", "all_rounder"],
    skillFit: ["advanced"],
    intentFit: ["work", "pro"],
    mustHaves: ["full_frame", "ibis", "evf", "interchangeable_lenses", "high_resolution", "high_burst"],
    shortWhy: "High resolution and premium AF for photo-heavy creators.",
  },
  {
    name: "A7 V Body",
    sku: "ILCE-7M5/B",
    tier: "premium",
    focusBias: "hybrid",
    focusScores: { video: 7, hybrid: 10, photo: 7 },
    beginnerFriendly: 5,
    specScores: { resolution: 7, speed: 10, lowLight: 8, cinemaTools: 8, portability: 5, bokeh: 8 },
    genreScores: { action_sports_photo: 10, weddings_events_video: 9, all_rounder: 10 },
    formFactor: "any",
    useCases: ["all_rounder", "portrait", "travel", "sports"],
    skillFit: ["advanced"],
    intentFit: ["work", "pro"],
    mustHaves: ["full_frame", "ibis", "evf", "interchangeable_lenses", "log_profiles", "high_burst"],
    shortWhy: "Modern full-frame hybrid for demanding mixed workflows.",
  },
  {
    name: "A7C II",
    sku: "ILCE-7CM2/B",
    tier: "mid",
    focusBias: "hybrid",
    focusScores: { video: 7, hybrid: 9, photo: 7 },
    beginnerFriendly: 7,
    specScores: { resolution: 7, speed: 8, lowLight: 8, cinemaTools: 7, portability: 8, bokeh: 8 },
    genreScores: { travel: 9, all_rounder: 9, portraits_headshots: 8, lifestyle_photo: 8 },
    formFactor: "compact",
    useCases: ["all_rounder", "travel", "portrait"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["fun", "work"],
    mustHaves: ["full_frame", "ibis", "evf", "interchangeable_lenses", "log_profiles"],
    shortWhy: "Compact full-frame hybrid with modern autofocus.",
  },
  {
    name: "A7 III",
    sku: "ILCE-7M3/B",
    tier: "mid",
    focusBias: "hybrid",
    focusScores: { video: 6, hybrid: 8, photo: 7 },
    beginnerFriendly: 7,
    specScores: { resolution: 6, speed: 7, lowLight: 8, cinemaTools: 6, portability: 5, bokeh: 8 },
    genreScores: { portraits_headshots: 8, weddings_events_video: 8, all_rounder: 8 },
    formFactor: "any",
    useCases: ["all_rounder", "portrait", "travel"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["fun", "work"],
    mustHaves: ["full_frame", "ibis", "evf", "interchangeable_lenses", "strong_low_light"],
    shortWhy: "Great value full-frame all-rounder.",
  },
  {
    name: "A7 IV Body",
    sku: "ILCE-7M4/B",
    tier: "premium",
    focusBias: "hybrid",
    focusScores: { video: 7, hybrid: 10, photo: 7 },
    beginnerFriendly: 6,
    specScores: { resolution: 7, speed: 9, lowLight: 8, cinemaTools: 8, portability: 5, bokeh: 8 },
    genreScores: { all_rounder: 10, weddings_events_video: 9, action_sports_photo: 9, portraits_headshots: 8 },
    formFactor: "any",
    useCases: ["all_rounder", "portrait", "travel", "sports"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["work", "pro"],
    mustHaves: ["full_frame", "ibis", "evf", "interchangeable_lenses", "log_profiles", "high_burst"],
    shortWhy: "Balanced, modern hybrid body for creators and pros.",
  },
  {
    name: "A6700",
    sku: "ILCE-6700/B",
    tier: "mid",
    focusBias: "hybrid",
    focusScores: { video: 8, hybrid: 9, photo: 7 },
    beginnerFriendly: 7,
    specScores: { resolution: 6, speed: 9, lowLight: 7, cinemaTools: 8, portability: 8, bokeh: 7 },
    genreScores: { action_sports_photo: 9, content_vlogging: 8, all_rounder: 9, travel: 8 },
    formFactor: "compact",
    useCases: ["all_rounder", "sports", "travel", "vlogging"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["fun", "work"],
    mustHaves: ["ibis", "evf", "interchangeable_lenses", "log_profiles", "high_burst"],
    shortWhy: "Fast APS-C hybrid with excellent autofocus and video options.",
  },
  {
    name: "A6400",
    sku: "ILCE-6400/B",
    tier: "entry",
    focusBias: "hybrid",
    focusScores: { video: 7, hybrid: 8, photo: 6 },
    beginnerFriendly: 8,
    specScores: { resolution: 5, speed: 8, lowLight: 6, cinemaTools: 6, portability: 8, bokeh: 6 },
    genreScores: { all_rounder: 8, travel: 8, content_vlogging: 7, action_sports_photo: 7 },
    formFactor: "compact",
    useCases: ["all_rounder", "travel", "sports", "vlogging"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["fun", "work"],
    mustHaves: ["evf", "interchangeable_lenses", "high_burst"],
    shortWhy: "Value APS-C option with strong autofocus.",
  },
  {
    name: "A6100",
    sku: "ILCE-6100/B",
    tier: "entry",
    focusBias: "hybrid",
    focusScores: { video: 6, hybrid: 7, photo: 5 },
    beginnerFriendly: 9,
    specScores: { resolution: 4, speed: 7, lowLight: 5, cinemaTools: 5, portability: 8, bokeh: 5 },
    genreScores: { family_video: 8, travel: 7, all_rounder: 7, content_vlogging: 6 },
    formFactor: "compact",
    useCases: ["all_rounder", "travel", "vlogging"],
    skillFit: ["beginner"],
    intentFit: ["fun"],
    mustHaves: ["interchangeable_lenses", "high_burst", "built_in_flash"],
    shortWhy: "Simple starter mirrorless camera with room to grow.",
  },
  {
    name: "RX100 VII",
    sku: "DSC-RX100M7",
    tier: "mid",
    focusBias: "hybrid",
    focusScores: { video: 7, hybrid: 8, photo: 7 },
    beginnerFriendly: 8,
    specScores: { resolution: 6, speed: 8, lowLight: 6, cinemaTools: 6, portability: 10, bokeh: 6 },
    genreScores: { travel: 10, content_vlogging: 8, family_video: 8, all_rounder: 8 },
    formFactor: "pocketable",
    useCases: ["travel", "vlogging", "all_rounder"],
    skillFit: ["beginner", "advanced"],
    intentFit: ["fun", "work"],
    mustHaves: ["evf", "high_burst", "built_in_flash"],
    shortWhy: "Premium pocket camera for travel and quick content.",
  },
];
