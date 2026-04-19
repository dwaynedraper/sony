import { cameras } from "./data/cameras";
import { AnswerState, FinalRecommendations } from "./types";

export function getRecommendations(answers: AnswerState): FinalRecommendations {
  // 1. Initial Pool
  let pool = [...cameras];

  // 2. Hard Exclusions
  if (answers.lensPreference === "Built-in lens") {
    pool = pool.filter(c => c.lensType === "built-in");
  } else if (answers.lensPreference === "Interchangeable lenses") {
    pool = pool.filter(c => c.lensType === "interchangeable");
  }

  if (answers.evfPreference === "Yes, I want an EVF") {
    pool = pool.filter(c => c.hasEVF);
  }

  if (answers.sensorPreference === "I strongly want full frame") {
    pool = pool.filter(c => c.sensor === "full-frame");
  }

  // Must-have features exclusions
  if (answers.mustHaves.includes("IBIS")) pool = pool.filter(c => c.hasIBIS);
  if (answers.mustHaves.includes("Full frame")) pool = pool.filter(c => c.sensor === "full-frame");
  if (answers.mustHaves.includes("S-Log")) pool = pool.filter(c => c.slog);
  if (answers.mustHaves.includes("S-Cinetone")) pool = pool.filter(c => c.sCinetone);
  if (answers.mustHaves.includes("Built-in lens")) pool = pool.filter(c => c.lensType === "built-in");
  if (answers.mustHaves.includes("Interchangeable lenses")) pool = pool.filter(c => c.lensType === "interchangeable");
  if (answers.mustHaves.includes("EVF")) pool = pool.filter(c => c.hasEVF);
  if (answers.mustHaves.includes("Dual card slots")) pool = pool.filter(c => c.dualSlots);
  if (answers.mustHaves.includes("High resolution stills")) pool = pool.filter(c => c.highResStills);

  // 3. Score Remaining
  const scoredCameras = pool.map(camera => {
    let score = 0;
    const reasons: string[] = [];

    // Genre matching
    if (answers.genre) {
      const g = answers.genre.toLowerCase();
      if (
        (g.includes("vlogging") && camera.bestFor.includes("vlogging")) ||
        (g.includes("filmmaking") && camera.bestFor.includes("filmmaking")) ||
        (g.includes("portrait") && camera.bestFor.includes("portraits")) ||
        (g.includes("street") && camera.bestFor.includes("street")) ||
        (g.includes("travel") && camera.bestFor.includes("travel")) ||
        (g.includes("wildlife") && camera.bestFor.includes("wildlife")) ||
        (g.includes("event") && (camera.bestFor.includes("events") || camera.bestFor.includes("weddings"))) ||
        (g.includes("client") && camera.bestFor.includes("commercial"))
      ) {
        score += 5;
        reasons.push("Perfect match for your primary genre.");
      }
    }

    // Usability & Seriousness
    if (answers.experience === "Beginner" && camera.beginnerFriendly) {
      score += 4;
      reasons.push("Extremely beginner-friendly and easy to use out of the box.");
    }
    if ((answers.seriousness === "This is professional / client-paid work" || answers.mustHaves.includes("Pro video workflow features")) && camera.proVideoFriendly) {
      score += 5;
      reasons.push("Built for professional workflows and rigorous client demands.");
    }

    // Photo/Video Bias
    if (answers.primaryUse === "Photo") {
      score += (camera.photoBias * 0.5);
      if (camera.photoBias > 7) reasons.push("Top-tier photography performance.");
    } else if (answers.primaryUse === "Video") {
      score += (camera.videoBias * 0.5);
      if (camera.videoBias > 7) reasons.push("Incredible dedicated video features.");
    } else if (answers.primaryUse === "Both photo and video") {
      score += (camera.hybridBias * 0.5);
      if (camera.hybridBias > 7) reasons.push("Excellent true hybrid capabilities.");
    }

    // Soft Checkbox Matches
    if (answers.mustHaves.includes("Strong low-light performance") && camera.lowLightStrong) {
      score += 3;
      reasons.push("Class-leading low light capabilities.");
    }
    if (answers.mustHaves.includes("Pocketable size") && camera.pocketableSize) {
      score += 3;
      reasons.push("Compact and highly portable.");
    }
    if (answers.mustHaves.includes("High burst / action shooting") && camera.actionFriendly) {
      score += 3;
      reasons.push("Fast sensor readout for action and sports.");
    }

    // Frustrations
    if (answers.frustration === "Carrying a bulky setup" && camera.formFactor === "pocketable") {
      score += 3;
      reasons.push("Solves your frustration with bulky gear—fits in your pocket.");
    }
    if (answers.frustration === "Buying extra lenses" && camera.lensType === "built-in") {
      score += 3;
      reasons.push("No extra lenses required; ready to shoot immediately.");
    }
    if (answers.frustration === "Weak low-light performance" && camera.lowLightStrong) {
      score += 3;
      reasons.push("Eliminates frustration with dark scenes; handles high ISO gracefully.");
    }
    if (answers.frustration === "Too much editing / complicated workflows" && camera.sCinetone) {
      score += 2;
      reasons.push("S-Cinetone provides gorgeous colors straight out of camera without heavy editing.");
    }

    // Deduplicate reasons
    const uniqueReasons = Array.from(new Set(reasons));
    // Keep top 4
    const finalReasons = uniqueReasons.slice(0, 4);
    if (finalReasons.length === 0) {
      finalReasons.push("A strong all-around choice for your settings.");
    }

    let tradeoff = "";
    if (camera.lensType === "built-in") tradeoff = "You cannot upgrade the lens later.";
    else if (!camera.hasEVF) tradeoff = "No viewfinder, relies solely on the back screen.";
    else if (!camera.hasIBIS) tradeoff = "Lacks in-body stabilization; requires stabilized lenses or gimbal.";
    else if (camera.sensor === "1-inch") tradeoff = "Smaller sensor yields less background blur than APS-C or Full Frame.";
    else tradeoff = "Larger investment and slightly larger footprint.";

    return {
      camera,
      score,
      reasons: finalReasons,
      tradeoff
    };
  });

  // Sort descending by score
  scoredCameras.sort((a, b) => b.score - a.score);

  const targetTier = answers.budgetTier ?? 6;

  // Best: Highest score where priceTier <= targetTier
  const bestMatches = scoredCameras.filter(c => c.camera.priceTier <= targetTier);
  let best = bestMatches.length > 0 ? bestMatches[0] : null;

  // Save: Highest score strictly lower than targetTier, excluding best
  const saveMatches = scoredCameras.filter(c => c.camera.priceTier < targetTier && c.camera.id !== best?.camera.id);
  // If targettier is 1, saveMatches will naturally be empty
  const save = saveMatches.length > 0 ? saveMatches[0] : null;

  // Upgrade: Highest score strictly higher than targetTier
  const upgradeMatches = scoredCameras.filter(c => c.camera.priceTier > targetTier && c.camera.id !== best?.camera.id);
  const upgrade = upgradeMatches.length > 0 ? upgradeMatches[0] : null;

  // If no best match found under budget (e.g. strict exclusions pushed price up)
  // Just give them the absolute highest score overall as 'best'
  if (!best && scoredCameras.length > 0) {
    best = scoredCameras[0];
  }

  return { best, save, upgrade };
}
