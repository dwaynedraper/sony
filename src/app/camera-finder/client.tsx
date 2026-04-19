"use client";

import { useState } from "react";
import { INITIAL_STATE, AnswerState, FinalRecommendations } from "./types";
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
  "Interchangeable lenses", "EVF", "Dual card slots", 
  "High burst / action shooting", "Strong low-light performance", 
  "Pocketable size", "Best autofocus", "Long recording reliability", 
  "High resolution stills", "Beginner-friendly simplicity", 
  "Pro video workflow features"
];

export default function CameraFinderClient() {
  const [state, setState] = useState<AnswerState>(INITIAL_STATE);
  const [results, setResults] = useState<FinalRecommendations | null>(null);

  const totalSteps = 11;
  const isResults = state.step > totalSteps;

  const update = <K extends keyof AnswerState>(key: K, value: AnswerState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (state.step === totalSteps) {
      // Calculate results
      const res = getRecommendations(state);
      setResults(res);
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    } else {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, step: prev.step - 1 }));
  };

  const restart = () => {
    setState(INITIAL_STATE);
    setResults(null);
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
            onClick={() => update(stateKey, opt)}
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
      case 7: return !!state.lensPreference;
      case 8: return !!state.evfPreference;
      case 9: return !!state.sensorPreference;
      case 10: return true; // Multi-select can be empty
      case 11: return !!state.frustration;
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
                onClick={() => update("budgetTier", tier.value)}
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

      {/* STEP 7 */}
      {state.step === 7 && renderChoice(
        "Which do you prefer?",
        ["Built-in lens", "Interchangeable lenses", "I’m open to either"],
        "lensPreference"
      )}

      {/* STEP 8 */}
      {state.step === 8 && renderChoice(
        "Do you want a viewfinder?",
        ["Yes, I want an EVF", "No, screen-only is fine", "No preference"],
        "evfPreference"
      )}

      {/* STEP 9 */}
      {state.step === 9 && renderChoice(
        "What sounds most like you?",
        ["I strongly want full frame", "I’m open to APS-C if it fits better", "I just want the best fit overall"],
        "sensorPreference"
      )}

      {/* STEP 10: Must-Haves */}
      {state.step === 10 && (
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

      {/* STEP 11 */}
      {state.step === 11 && renderChoice(
        "What would frustrate you most?",
        ["Carrying a bulky setup", "Buying extra lenses", "Weak low-light performance", "Missing fast action", "Not enough background blur", "Weak video tools", "Too much editing / complicated workflows", "Spending more than I need"],
        "frustration"
      )}

      {/* Content wrapper for Nav */}
      {!isResults && (
        <div className={styles.navBar}>
          {state.step > 1 ? (
            <button className={styles.btnSecondary} onClick={prevStep}>Back</button>
          ) : (
            <div></div> // Spacer
          )}
          
          <button 
            className={styles.btnPrimary} 
            onClick={nextStep}
            disabled={!canProceed()}
          >
            {state.step === totalSteps ? "Show My Results" : "Continue"}
          </button>
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
                <ul className={styles.reasonsList}>
                  {results.best.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
                <div className={styles.tradeoff}>
                  <strong>Tradeoff:</strong> {results.best.tradeoff}
                </div>
              </div>
            )}

            {/* SAVE MONEY */}
            {results.save && (
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h3 className={styles.resultTitle}>{results.save.camera.name}</h3>
                  <span className={`${styles.resultBadge} ${styles.saveBadge}`}>Save Money</span>
                </div>
                <ul className={styles.reasonsList}>
                  {results.save.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
                <div className={styles.tradeoff}>
                  <strong>Tradeoff:</strong> {results.save.tradeoff}
                </div>
              </div>
            )}

            {/* UPGRADE */}
            {results.upgrade && (
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h3 className={styles.resultTitle}>{results.upgrade.camera.name}</h3>
                  <span className={`${styles.resultBadge} ${styles.upgradeBadge}`}>Premium Upgrade</span>
                </div>
                <ul className={styles.reasonsList}>
                  {results.upgrade.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
                <div className={styles.tradeoff}>
                  <strong>Tradeoff:</strong> {results.upgrade.tradeoff}
                </div>
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
