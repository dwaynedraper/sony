"use client";

import { useState, useMemo } from "react";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { INITIAL_STATE, AnswerState } from "./types";
import { getRecommendations } from "./engine";
import styles from "./camera-finder.module.scss";

const BUDGET_TIERS = [
  { label: "Under $700", value: 1 },
  { label: "$700 – $1,000", value: 2 },
  { label: "$1,000 – $1,500", value: 3 },
  { label: "$1,500 – $2,200", value: 4 },
  { label: "$2,200 – $3,200", value: 5 },
  { label: "$3,200+", value: 6 },
];

const MUST_HAVES = [
  "IBIS", "Full frame", "S-Log", "S-Cinetone", "Built-in lens", 
  "Interchangeable lenses", "EVF", "Built-in flash", "Dual card slots", 
  "High burst / action shooting", "Strong low-light performance", 
  "Pocketable size", "Best autofocus", "Long recording reliability", 
  "High resolution stills", "Beginner-friendly simplicity", 
  "Pro video workflow features"
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
      bestReason: z.object({ bullets: z.array(z.string()), tradeoff: z.string() }).optional(),
      saveReason: z.object({ bullets: z.array(z.string()), tradeoff: z.string() }).optional(),
      upgradeReason: z.object({ bullets: z.array(z.string()), tradeoff: z.string() }).optional(),
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

  // Generic Choice Grid Render
  const renderChoice = (question: string, options: string[], stateKey: keyof AnswerState) => (
    <div>
      <h2 className={styles.question}>{question}</h2>
      <div className={`${styles.choiceGrid} mt-8`}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`${styles.choiceCard} ${state[stateKey] === opt ? styles.selected : ""}`}
            onClick={() => handleSingleChoice(stateKey, opt)}
          >
            <span className={styles.choiceLabel}>{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const canProceed = () => {
    switch (state.step) {
      case 1: return !!state.primaryUse;
      case 2: return !!state.genre;
      case 3: return !!state.experience;
      case 4: return !!state.seriousness;
      case 5: return !!state.budgetTier;
      case 6: return !!state.formFactor;
      case 7: return true; // Multi-select can be empty
      default: return false;
    }
  };

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

      {/* STEP 1: Primary Use */}
      {state.step === 1 && renderChoice(
        "What are you primarily buying this camera for?",
        ["Photo", "Video", "Both photo and video"],
        "primaryUse"
      )}

      {/* STEP 2: Path-specific genre */}
      {state.step === 2 && state.primaryUse === "Video" && renderChoice(
        "What kind of video work do you do most?",
        ["Vlogging", "Filmmaking / narrative", "Client work / commercial", "YouTube / talking head", "Social content / short-form", "Events / documentary / run-and-gun"],
        "genre"
      )}
      {state.step === 2 && state.primaryUse === "Photo" && renderChoice(
        "What kind of photography do you do most?",
        ["Portraits", "Street / everyday carry", "Travel", "Landscape", "Wildlife / birds", "Sports / action", "Real estate / architecture", "Events / weddings", "Product / studio", "Family / lifestyle"],
        "genre"
      )}
      {state.step === 2 && state.primaryUse === "Both photo and video" && renderChoice(
        "What matters slightly more to you?",
        ["Photo leaning", "Balanced hybrid", "Video leaning"],
        "genre"
      )}

      {/* STEP 3 */}
      {state.step === 3 && renderChoice(
        "What best describes your experience level?",
        ["Beginner", "Intermediate", "Advanced"],
        "experience"
      )}

      {/* STEP 4 */}
      {state.step === 4 && renderChoice(
        "How serious is this for you?",
        ["Just for fun", "Serious hobby", "I make some money with it", "This is professional / client-paid work"],
        "seriousness"
      )}

      {/* STEP 5: Budget */}
      {state.step === 5 && (
        <div>
          <h2 className={styles.question}>What budget range best fits you?</h2>
          <p className="mt-2 text-text-secondary">If looking at interchangeable lenses, this is for the camera body.</p>
          <div className={`${styles.choiceGrid} mt-8`}>
            {BUDGET_TIERS.map(tier => (
              <button
                key={tier.value}
                type="button"
                className={`${styles.choiceCard} ${state.budgetTier === tier.value ? styles.selected : ""}`}
                onClick={() => handleSingleChoice("budgetTier", tier.value)}
              >
                <span className={styles.choiceLabel}>{tier.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 6 */}
      {state.step === 6 && renderChoice(
        "How important is size and portability?",
        ["Pocketable if possible", "Small and lightweight", "Standard camera size is fine", "Size does not matter"],
        "formFactor"
      )}

      {/* STEP 7: Must-Haves */}
      {state.step === 7 && (
        <div>
          <h2 className={styles.question}>Which features are must-haves for you?</h2>
          <p className="mt-2 text-text-secondary">Select any absolute dealbreakers.</p>
          <div className={`${styles.checklistGrid} mt-8`}>
            {MUST_HAVES.map(item => {
              const isSelected = state.mustHaves.includes(item);
              return (
                <label 
                  key={item}
                  className={`${styles.checkboxItem} ${isSelected ? styles.selected : ""}`}
                >
                  <input 
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) update("mustHaves", [...state.mustHaves, item]);
                      else update("mustHaves", state.mustHaves.filter(i => i !== item));
                    }}
                  />
                  <span className={styles.checkboxLabel}>{item}</span>
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
            <button 
              className={styles.btnPrimary} 
              onClick={nextStep}
            >
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
                  <h3 className={styles.resultTitle}>{results.best.camera.name}</h3>
                  <span className={`${styles.resultBadge} ${styles.bestBadge}`}>Best Match</span>
                </div>
                
                {isLoading && !object?.bestReason?.bullets ? (
                  <div className="flex gap-2 items-center text-accent text-sm italic font-medium animate-pulse mt-4 bg-black/20 p-4 rounded-lg">
                    <span>✧</span> AI is analyzing your exact needs...
                  </div>
                ) : object?.bestReason?.bullets ? (
                  <>
                    <ul className={styles.reasonsList}>
                      {object.bestReason.bullets.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                    {object.bestReason.tradeoff && (
                      <div className={styles.tradeoff}>
                        <strong>Tradeoff:</strong> {object.bestReason.tradeoff}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <ul className={styles.reasonsList}>
                      {results.best.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                    <div className={styles.tradeoff}>
                      <strong>Tradeoff:</strong> {results.best.tradeoff}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SAVE MONEY */}
            {results.save && (
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h3 className={styles.resultTitle}>{results.save.camera.name}</h3>
                  <span className={`${styles.resultBadge} ${styles.saveBadge}`}>Save Money</span>
                </div>
                
                {isLoading && !object?.saveReason?.bullets ? (
                  <div className="flex gap-2 items-center text-text-muted text-sm italic animate-pulse mt-4 bg-black/20 p-4 rounded-lg">
                    <span>✧</span> Finding the best budget alternative...
                  </div>
                ) : object?.saveReason?.bullets ? (
                  <>
                    <ul className={styles.reasonsList}>
                      {object.saveReason.bullets.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                    {object.saveReason.tradeoff && (
                      <div className={styles.tradeoff}>
                        <strong>Tradeoff:</strong> {object.saveReason.tradeoff}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <ul className={styles.reasonsList}>
                      {results.save.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                    <div className={styles.tradeoff}>
                      <strong>Tradeoff:</strong> {results.save.tradeoff}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* UPGRADE */}
            {results.upgrade && (
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h3 className={styles.resultTitle}>{results.upgrade.camera.name}</h3>
                  <span className={`${styles.resultBadge} ${styles.upgradeBadge}`}>Premium Upgrade</span>
                </div>
                
                {isLoading && !object?.upgradeReason?.bullets ? (
                  <div className="flex gap-2 items-center text-text-muted text-sm italic animate-pulse mt-4 bg-black/20 p-4 rounded-lg">
                    <span>✧</span> Calculating the ultimate upgrade...
                  </div>
                ) : object?.upgradeReason?.bullets ? (
                  <>
                    <ul className={styles.reasonsList}>
                      {object.upgradeReason.bullets.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                    {object.upgradeReason.tradeoff && (
                      <div className={styles.tradeoff}>
                        <strong>Tradeoff:</strong> {object.upgradeReason.tradeoff}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <ul className={styles.reasonsList}>
                      {results.upgrade.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                    <div className={styles.tradeoff}>
                      <strong>Tradeoff:</strong> {results.upgrade.tradeoff}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* If NO MATCHES */}
            {!results.best && !results.save && !results.upgrade && (
              <div className="text-center p-8 bg-surface border border-border rounded-xl">
                <h3 className="text-xl font-bold mb-2">No exact matches</h3>
                <p className="text-text-secondary">Your must-have features combined with your budget created a requirement that no current camera fully meets. Try loosening your budget or removing a must-have.</p>
              </div>
            )}
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
