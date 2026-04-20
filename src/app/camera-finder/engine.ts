import { cameras, CameraModel, Focus, UseCase } from "./data/cameras";
import { AnswerState, FinalRecommendations, RecommendationResult } from "./types";

function getFocusScore(camera: CameraModel, focus: Focus) {
  if (camera.focusScores?.[focus]) return camera.focusScores[focus];
  if (camera.focusBias === focus) return 10;
  if (camera.focusBias === "hybrid") return 7;
  return 3;
}

function getBeginnerFriendlyScore(camera: CameraModel) {
  if (typeof camera.beginnerFriendly === "number") return camera.beginnerFriendly;
  if (camera.skillFit.includes("beginner") && camera.skillFit.includes("advanced")) return 7;
  if (camera.skillFit.includes("beginner")) return 9;
  return 3;
}

function getGenreScore(camera: CameraModel, useCase: UseCase) {
  if (typeof camera.genreScores?.[useCase] === "number") return camera.genreScores[useCase] as number;
  if (camera.useCases.includes(useCase)) return 8;
  return 4;
}

function getUseCaseSpecContribution(camera: CameraModel, useCase: UseCase) {
  const spec = camera.specScores;
  if (!spec) return 0;

  const weightsByUseCase: Record<UseCase, Partial<Record<keyof NonNullable<CameraModel["specScores"]>, number>>> = {
    cinema_commercial: { cinemaTools: 0.35, lowLight: 0.25, speed: 0.2, bokeh: 0.1, resolution: 0.1 },
    content_vlogging: { portability: 0.35, cinemaTools: 0.2, lowLight: 0.2, speed: 0.15, bokeh: 0.1 },
    family_video: { portability: 0.35, lowLight: 0.25, speed: 0.2, cinemaTools: 0.1, bokeh: 0.1 },
    weddings_events_video: { lowLight: 0.35, speed: 0.25, cinemaTools: 0.2, bokeh: 0.1, portability: 0.1 },
    documentary_run_gun: { portability: 0.3, lowLight: 0.25, cinemaTools: 0.2, speed: 0.15, bokeh: 0.1 },
    portraits_headshots: { bokeh: 0.4, resolution: 0.25, lowLight: 0.2, speed: 0.1, portability: 0.05 },
    real_estate_arch: { resolution: 0.45, lowLight: 0.2, bokeh: 0.15, speed: 0.1, portability: 0.1 },
    action_sports_photo: { speed: 0.5, lowLight: 0.2, resolution: 0.15, bokeh: 0.1, portability: 0.05 },
    product_photo: { resolution: 0.45, bokeh: 0.2, lowLight: 0.2, speed: 0.05, portability: 0.1 },
    lifestyle_photo: { bokeh: 0.25, portability: 0.2, lowLight: 0.2, resolution: 0.2, speed: 0.15 },
    landscape_wildlife: { resolution: 0.4, speed: 0.25, lowLight: 0.15, portability: 0.1, bokeh: 0.1 },
    all_rounder: { speed: 0.2, lowLight: 0.2, portability: 0.2, bokeh: 0.15, resolution: 0.15, cinemaTools: 0.1 },
    travel: { portability: 0.35, resolution: 0.2, lowLight: 0.2, speed: 0.15, bokeh: 0.1 },
    vlogging: { portability: 0.35, cinemaTools: 0.2, lowLight: 0.2, speed: 0.15, bokeh: 0.1 },
    portrait: { bokeh: 0.4, resolution: 0.25, lowLight: 0.2, speed: 0.1, portability: 0.05 },
    sports: { speed: 0.5, lowLight: 0.2, resolution: 0.15, bokeh: 0.1, portability: 0.05 },
    cinema: { cinemaTools: 0.35, lowLight: 0.25, speed: 0.2, bokeh: 0.1, resolution: 0.1 },
  };

  const weights = weightsByUseCase[useCase];
  let weighted = 0;
  for (const key of Object.keys(weights) as Array<keyof typeof weights>) {
    weighted += spec[key] * (weights[key] ?? 0);
  }
  return weighted * 0.4;
}

export function getRecommendations(answers: AnswerState): FinalRecommendations {
  // 1. Initial Pool
  let pool = [...cameras];

  // 2. Hard Exclusions based on Must-Haves
  // Filter out any camera that does not have ALL selected must-haves.
  pool = pool.filter(camera => {
    for (const mustHave of answers.mustHaves) {
      if (!camera.mustHaves.includes(mustHave)) return false;
    }
    return true;
  });

  // 3. Score Remaining
  const scoredCameras = pool.map(camera => {
    let score = 0;

    if (answers.focus) {
      score += getFocusScore(camera, answers.focus) * 0.5;
    }

    if (answers.useCase && camera.useCases.includes(answers.useCase)) {
      score += 2;
    }

    if (answers.useCase) {
      score += getGenreScore(camera, answers.useCase) * 0.45;
      score += getUseCaseSpecContribution(camera, answers.useCase);
    }

    if (answers.focus === "video" && answers.useCase === "cinema_commercial") {
      const isCinemaBody = ["FX3A", "FX30 Body"].includes(camera.name);
      const isVideoSpecialist = camera.name === "A7S III";
      const isHybridLeaning = ["FX2", "A7 IV Body", "A7 V Body", "A7C II", "A6700"].includes(camera.name);
      if (isCinemaBody) score += 4;
      if (isVideoSpecialist) score += 3;
      if (isHybridLeaning) score -= 2;
    }

    if (answers.skill) {
      const beginnerFriendly = getBeginnerFriendlyScore(camera);
      if (answers.skill === "beginner") {
        score += beginnerFriendly * 0.4;
      } else {
        score += (11 - beginnerFriendly) * 0.4;
      }
    }

    if (answers.intent && camera.intentFit.includes(answers.intent)) {
      score += 3;
    }

    if (answers.formFactor) {
      if (answers.formFactor === camera.formFactor) {
        score += 3;
      } else if (answers.formFactor === "any") {
        score += 1;
      }
    }

    const baseScore = score;

    // Soft-Bias Budget Penalty
    // Exceeding the budget applies a heavy penalty (-6 points per tier difference), 
    // ensuring expensive cameras fall to the bottom UNLESS their spec scores perfectly align 
    // when nothing else does (e.g. demanding 8k on an entry budget).
    const tierMap = { entry: 1, mid: 2, premium: 3, no_limit: 4 };
    if (answers.budget) {
      const targetTier = tierMap[answers.budget];
      const cameraTier = tierMap[camera.tier];
      
      if (cameraTier > targetTier) {
        const diff = cameraTier - targetTier;
        score -= (diff * 6); // Hard penalty
      } else if (cameraTier === targetTier) {
        score += 2; // Slight reward for exact match
      }
    }

    return {
      camera,
      score,
      baseScore,
      isOverBudget: answers.budget ? tierMap[camera.tier] > tierMap[answers.budget] : false
    };
  });

  scoredCameras.sort((a, b) => b.score - a.score);

  if (scoredCameras.length === 0) {
    return { best: null, alternatives: [] };
  }

  const best = scoredCameras[0];
  let alternatives = scoredCameras.slice(1);

  // Identify Stretch Pick: An alternative that mathematically scored higher than the Best Pick (baseScore),
  // but lost because it was over budget. We take the one with the absolute highest baseScore possible.
  let stretchPickIndex = -1;
  let highestBaseScore = -1;

  for (let i = 0; i < alternatives.length; i++) {
    const alt = alternatives[i];
    if (alt.isOverBudget && alt.baseScore > best.baseScore && alt.baseScore > highestBaseScore) {
      highestBaseScore = alt.baseScore;
      stretchPickIndex = i;
    }
  }

  if (stretchPickIndex !== -1) {
    const stretchPick = alternatives[stretchPickIndex];
    (stretchPick as RecommendationResult).isStretchPick = true;
    alternatives.splice(stretchPickIndex, 1);
    alternatives.unshift(stretchPick);
  }

  // Remove the temporary baseScore from the final interface cast
  return {
    best,
    alternatives: alternatives.slice(0, 3)
  };
}
