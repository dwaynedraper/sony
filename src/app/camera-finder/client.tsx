"use client";

import { useState, useMemo } from "react";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { INITIAL_STATE, AnswerState } from "./types";
import { getRecommendations } from "./engine";
import styles from "./camera-finder.module.scss";
import { Focus, UseCase, Skill, Intent, Budget, FormFactor, MustHave } from "./data/cameras";

const FOCUS_OPTIONS: { id: Focus, label: string }[] = [
  { id: "video", label: "Mostly video" },
  { id: "hybrid", label: "Hybrid photo + video" },
  { id: "photo", label: "Mostly photo" },
];

const VIDEO_GENRE_OPTIONS: { id: UseCase; label: string }[] = [
  { id: "cinema_commercial", label: "Cinema / commercial" },
  { id: "content_vlogging", label: "Content / vlogging" },
  { id: "family_video", label: "Family / casual capture" },
  { id: "weddings_events_video", label: "Weddings / events" },
  { id: "documentary_run_gun", label: "Documentary / run-and-gun" },
];

const PHOTO_GENRE_OPTIONS: { id: UseCase; label: string }[] = [
  { id: "portraits_headshots", label: "Portraits / headshots" },
  { id: "real_estate_arch", label: "Real estate / architecture" },
  { id: "action_sports_photo", label: "Action / sports" },
  { id: "product_photo", label: "Product / commercial stills" },
  { id: "lifestyle_photo", label: "Lifestyle / general photo" },
  { id: "landscape_wildlife", label: "Landscape / wildlife" },
];

const HYBRID_GENRE_OPTIONS: { id: UseCase; label: string }[] = [
  { id: "all_rounder", label: "General all-rounder mix" },
  { id: "content_vlogging", label: "Content / vlogging" },
  { id: "travel", label: "Travel / everyday carry" },
  { id: "family_video", label: "Family / casual capture" },
  { id: "weddings_events_video", label: "Weddings / events" },
  { id: "documentary_run_gun", label: "Documentary / run-and-gun" },
  { id: "portraits_headshots", label: "Portraits / headshots" },
  { id: "action_sports_photo", label: "Action / sports" },
  { id: "landscape_wildlife", label: "Landscape / wildlife" },
  { id: "product_photo", label: "Product / commercial" },
  { id: "real_estate_arch", label: "Real estate / architecture" },
];

const SKILL_OPTIONS: { id: Skill; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "advanced", label: "Advanced" },
];

const INTENT_OPTIONS: { id: Intent; label: string }[] = [
  { id: "fun", label: "Just for fun" },
  { id: "work", label: "I make some money with it" },
  { id: "pro", label: "This is professional / client-paid work" },
];

const BUDGET_TIERS: { id: Budget; label: string }[] = [
  { id: "entry", label: "Entry (Under $1,000)" },
  { id: "mid", label: "Mid ($1,000 – $2,200)" },
  { id: "premium", label: "Premium ($2,200+)" },
  { id: "no_limit", label: "No limit" },
];

const FORM_OPTIONS: { id: FormFactor; label: string }[] = [
  { id: "pocketable", label: "Pocketable if possible" },
  { id: "compact", label: "Small and lightweight" },
  { id: "any", label: "Size does not matter" },
];

const MUST_HAVES: { id: MustHave, label: string }[] = [
  { id: "full_frame", label: "Full-frame sensor" },
  { id: "ibis", label: "In-body image stabilization (IBIS)" },
  { id: "evf", label: "Electronic viewfinder (EVF)" },
  { id: "built_in_flash", label: "Built-in flash" },
  { id: "log_profiles", label: "Log profiles" },
  { id: "interchangeable_lenses", label: "Interchangeable lenses" },
  { id: "high_burst", label: "High burst/action capable" },
  { id: "strong_low_light", label: "Strong low-light performance" },
  { id: "high_resolution", label: "High resolution" },
];

export default function CameraFinderClient() {
  const [state, setState] = useState<AnswerState>(INITIAL_STATE);

  const totalSteps = 7;
  const isResults = state.step > totalSteps;

  const results = useMemo(() => {
    if (!isResults) return null;
    return getRecommendations(state);
  }, [isResults, state]);

  const { submit, isLoading, object, error } = useObject({
    api: '/api/generate-rationale',
    schema: z.object({
      bestReason: z.object({ text: z.string(), tradeoff: z.string() }),
      alternatives: z.array(z.object({ sku: z.string(), text: z.string(), tradeoff: z.string() })),
    }),
  });

  const update = <K extends keyof AnswerState>(key: K, value: AnswerState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (state.step === totalSteps) {
      const res = getRecommendations(state);
      submit({ answers: state, results: res });
    }
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const handleSingleChoice = <K extends keyof AnswerState>(key: K, value: AnswerState[K]) => {
    update(key, value);
    // Auto-advance after small delay for single choice buttons
    setTimeout(() => {
      if (state.step === totalSteps) {
        const finalState = { ...state, [key]: value };
        const res = getRecommendations(finalState);
        submit({ answers: finalState, results: res });
      }
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }, 250);
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, step: prev.step - 1 }));
  };

  const restart = () => {
    setState(INITIAL_STATE);
  };

  const renderChoice = <K extends keyof AnswerState, V extends string>(
    question: string,
    options: { id: V; label: string }[],
    stateKey: K
  ) => (
    <div>
      <h2 className={styles.question}>{question}</h2>
      <div className={`${styles.choiceGrid} mt-8`}>
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.choiceCard} ${state[stateKey] as unknown === opt.id as unknown ? styles.selected : ""}`}
            onClick={() => handleSingleChoice(stateKey, opt.id as unknown as AnswerState[K])}
          >
            <span className={styles.choiceLabel}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const canProceed = () => {
    switch (state.step) {
      case 1: return !!state.focus;
      case 2: return !!state.useCase;
      case 3: return !!state.skill;
      case 4: return !!state.intent;
      case 5: return !!state.budget;
      case 6: return !!state.formFactor;
      case 7: return true; // Multi-select can be empty
      default: return false;
    }
  };

  let genreOptions = HYBRID_GENRE_OPTIONS;
  if (state.focus === "video") genreOptions = VIDEO_GENRE_OPTIONS;
  else if (state.focus === "photo") genreOptions = PHOTO_GENRE_OPTIONS;

  return (
    <div className={styles.wizardContainer}>
      {!isResults && (
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            Step {state.step} of {totalSteps}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-border h-1 rounded-full overflow-hidden">
            <div 
              className="bg-accent h-full transition-all duration-300"
              style={{ width: `${(state.step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Primary Focus */}
      {state.step === 1 && renderChoice("What are you primarily buying this camera for?", FOCUS_OPTIONS, "focus")}

      {/* STEP 2: Genre */}
      {state.step === 2 && renderChoice("What kind of work do you do most?", genreOptions, "useCase")}

      {/* STEP 3: Skill */}
      {state.step === 3 && renderChoice("What best describes your experience level?", SKILL_OPTIONS, "skill")}

      {/* STEP 4: Intent */}
      {state.step === 4 && renderChoice("How serious is this for you?", INTENT_OPTIONS, "intent")}

      {/* STEP 5: Budget */}
      {state.step === 5 && (
        <div>
          <h2 className={styles.question}>What budget range best fits you?</h2>
          <p className="mt-2 text-text-secondary">If looking at interchangeable lenses, this is for the camera body.</p>
          <div className={`${styles.choiceGrid} mt-8`}>
            {BUDGET_TIERS.map(tier => (
              <button
                key={tier.id}
                type="button"
                className={`${styles.choiceCard} ${state.budget === tier.id ? styles.selected : ""}`}
                onClick={() => handleSingleChoice("budget", tier.id)}
              >
                <span className={styles.choiceLabel}>{tier.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 6: Form Factor */}
      {state.step === 6 && renderChoice("How important is size and portability?", FORM_OPTIONS, "formFactor")}

      {/* STEP 7: Must-Haves */}
      {state.step === 7 && (
        <div>
          <h2 className={styles.question}>Which features are must-haves for you?</h2>
          <p className="mt-2 text-text-secondary">Select any absolute dealbreakers.</p>
          <div className={`${styles.checklistGrid} mt-8`}>
            {MUST_HAVES.map(item => {
              const isSelected = state.mustHaves.includes(item.id);
              return (
                <label 
                  key={item.id}
                  className={`${styles.checkboxItem} ${isSelected ? styles.selected : ""}`}
                >
                  <input 
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) update("mustHaves", [...state.mustHaves, item.id]);
                      else update("mustHaves", state.mustHaves.filter(i => i !== item.id));
                    }}
                  />
                  <span className={styles.checkboxLabel}>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Content wrapper for Nav */}
      {!isResults && (
        <div className={styles.navBar}>
          {state.step > 1 ? (
            <button className={styles.btnSecondary} onClick={prevStep}>Back</button>
          ) : (
            <div></div> // Spacer
          )}
          
          <div style={{ flex: 1 }}></div> // Flexible spacer
          
          {state.step === 7 && (
            <button className={styles.btnPrimary} onClick={nextStep}>
              Continue
            </button>
          )}
        </div>
      )}

      {/* RESULTS SCREEN */}
      {isResults && results && (
        <div>
          <h2 className={styles.question}>Your Recommendations</h2>
          <p className="mt-2 text-text-secondary mb-8">Based on your preferences and budget, here are your best matches.</p>
          
          <div className={styles.resultsContainer}>
            {/* BEST MATCH */}
            {results.best && (
              <div className={`${styles.resultCard} ${styles.bestMatch}`}>
                <div className={styles.resultHeader}>
                  <div className="flex flex-col">
                    <h3 className={styles.resultTitle}>{results.best.camera.name}</h3>
                    {results.best.isOverBudget && (
                      <span className="text-red-500 font-bold mt-1">$$$ Above original budget tier</span>
                    )}
                    {results.best.missingMustHaves && results.best.missingMustHaves.length > 0 && (
                      <span className="text-orange-500 font-bold mt-1 text-sm tracking-wide">Missing {results.best.missingMustHaves.length} requested feature(s)</span>
                    )}
                  </div>
                  <span className={`${styles.resultBadge} ${styles.bestBadge}`}>Best Match</span>
                </div>
                
                {isLoading && !object?.bestReason?.text ? (
                  <div className="flex gap-2 items-center text-accent text-sm italic font-medium animate-pulse mt-4 bg-black/20 p-4 rounded-lg">
                    <span>✧</span> AI is analyzing your exact needs...
                  </div>
                ) : object?.bestReason?.text ? (
                  <>
                    <p className="mt-4 text-slate-300 leading-relaxed">
                      {object.bestReason.text}
                    </p>
                    {object.bestReason.tradeoff && (
                      <div className={styles.tradeoff}>
                        <strong>Tradeoff:</strong> {object.bestReason.tradeoff}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-slate-300 leading-relaxed text-sm italic">
                    {results.best.camera.shortWhy}
                  </p>
                )}
              </div>
            )}

            {/* ALTERNATIVES */}
            {results.alternatives.map((alt, idx) => {
              const altAI = object?.alternatives?.find(a => a?.sku === alt.camera.sku);

              return (
                <div key={alt.camera.sku} className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <div className="flex flex-col">
                      <h3 className={styles.resultTitle}>{alt.camera.name}</h3>
                      {alt.isOverBudget && (
                        <span className="text-red-500 font-bold mt-1">$$$ Above original budget tier</span>
                      )}
                      {alt.missingMustHaves && alt.missingMustHaves.length > 0 && (
                        <span className="text-orange-500 font-bold mt-1 text-sm tracking-wide">Missing {alt.missingMustHaves.length} requested feature(s)</span>
                      )}
                    </div>
                    {alt.isStretchPick ? (
                      <span className={`${styles.resultBadge} ${styles.bestBadge}`} style={{ backgroundColor: '#eab308', color: '#1a1a1a' }}>Stretch Pick</span>
                    ) : idx === 0 ? (
                      <span className={`${styles.resultBadge} ${styles.saveBadge}`}>Top Alternative</span>
                    ) : null}
                  </div>
                  
                  {alt.isStretchPick && (
                    <p className="mt-2 text-yellow-500 text-sm font-medium italic mb-2">
                      The best fit if your budget could be stretched would actually be this.
                    </p>
                  )}
                  
                  {isLoading && !altAI?.text ? (
                    <div className="flex gap-2 items-center text-text-muted text-sm italic animate-pulse mt-4 bg-black/20 p-4 rounded-lg">
                      <span>✧</span> Analyzing alternative capability...
                    </div>
                  ) : altAI?.text ? (
                    <>
                      <p className="mt-4 text-slate-300 leading-relaxed">
                        {altAI.text}
                      </p>
                      {altAI.tradeoff && (
                        <div className={styles.tradeoff}>
                          <strong>Tradeoff:</strong> {altAI.tradeoff}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="mt-4 text-slate-300 leading-relaxed text-sm italic">
                      {alt.camera.shortWhy}
                    </p>
                  )}
                </div>
              );
            })}
            

          </div>

          <div className={styles.restartBtn}>
            <button className={styles.btnSecondary} onClick={() => setState(prev => ({...prev, step: totalSteps}))}>
              Edit Answers
            </button>
            <span className="mx-2" />
            <button className={styles.btnSecondary} onClick={restart}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
