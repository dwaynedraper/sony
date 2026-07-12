"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import styles from "./basket-builder.module.scss";

// Must mirror the route's schema exactly. `condition` is nullable rather than
// optional because OpenAI Structured Outputs requires every key to be required.
const basketSchema = z.object({
  summary: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      tier: z.enum(["essential", "do_it_right", "only_if"]),
      why: z.string(),
      condition: z.string().nullable(),
    })
  ),
});

type Tier = "essential" | "do_it_right" | "only_if";

const TIERS: { key: Tier; name: string; blurb: string; cls: string }[] = [
  {
    key: "essential",
    name: "Essential",
    blurb: "They can't do this work without it.",
    cls: "essential",
  },
  {
    key: "do_it_right",
    name: "Do it right",
    blurb: "The difference between a hobby result and work someone pays for.",
    cls: "doItRight",
  },
  {
    key: "only_if",
    name: "Only if…",
    blurb: "Situational — the condition is the question to ask the customer.",
    cls: "onlyIf",
  },
];

const GENRES = [
  "Portraits", "Real Estate", "Sports", "Wildlife", "Landscape",
  "Events & Weddings", "Vlogging / Content", "Video / Cinema",
  "Product", "Macro", "Travel", "Astro", "Family / Everyday",
];

export default function BasketBuilderClient() {
  const [gear, setGear] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [otherGenre, setOtherGenre] = useState("");
  const [needs, setNeeds] = useState("");
  const [copied, setCopied] = useState(false);

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/basket",
    schema: basketSchema,
  });

  const genres = [...picked, ...(otherGenre.trim() ? [otherGenre.trim()] : [])].join(", ");
  const canSubmit = (gear.trim() || genres) && !isLoading;

  function toggleGenre(g: string) {
    setPicked((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function build() {
    if (!canSubmit) return;
    setCopied(false);
    submit({ gear: gear.trim(), genres, needs: needs.trim() });
  }

  function reset() {
    stop();
    setGear("");
    setPicked([]);
    setOtherGenre("");
    setNeeds("");
    setCopied(false);
  }

  const items = (object?.items ?? []).filter(Boolean);

  async function copyPitch() {
    if (!object) return;
    const lines: string[] = [];
    if (object.summary) lines.push(object.summary, "");
    for (const t of TIERS) {
      const group = items.filter((i) => i?.tier === t.key);
      if (!group.length) continue;
      lines.push(t.name.toUpperCase());
      for (const i of group) {
        lines.push(`• ${i?.name} — ${i?.why}${i?.condition ? ` (only if ${i.condition})` : ""}`);
      }
      lines.push("");
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n").trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the text is on screen */
    }
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.h1}>Basket Builder</h1>
      <p className={styles.sub}>
        Three questions, one honest basket. Depth matches the job — sports might need three things,
        real estate needs a lot more.
      </p>

      <div className={styles.field}>
        <label className={styles.label}>
          Camera or lens purchased
          <span className={styles.labelHint}>What they just bought, or already own.</span>
        </label>
        <input
          className={styles.input}
          value={gear}
          onChange={(e) => setGear(e.target.value)}
          placeholder="e.g. A7 IV with the 28-70 kit lens"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Genres of interest
          <span className={styles.labelHint}>Pick any that apply.</span>
        </label>
        <div className={styles.chips}>
          {GENRES.map((g) => (
            <div
              key={g}
              className={`${styles.chip} ${picked.includes(g) ? styles.chipOn : ""}`}
              onClick={() => toggleGenre(g)}
            >
              {g}
            </div>
          ))}
        </div>
        <input
          className={styles.input}
          style={{ marginTop: 9 }}
          value={otherGenre}
          onChange={(e) => setOtherGenre(e.target.value)}
          placeholder="Something else? (e.g. food, boudoir, concerts)"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Special needs
          <span className={styles.labelHint}>
            Anything that changes the answer — how they work, what they sell, what they struggle with.
          </span>
        </label>
        <textarea
          className={styles.textarea}
          value={needs}
          onChange={(e) => setNeeds(e.target.value)}
          placeholder="e.g. Sells virtual tours, shoots dim interiors, travels light, on a tight budget"
        />
      </div>

      <button className={styles.submit} onClick={build} disabled={!canSubmit}>
        {isLoading ? "Building basket…" : "Build the basket"}
      </button>

      {error && <div className={styles.error}>Couldn&apos;t build the basket. Try again in a moment.</div>}

      {isLoading && !items.length && (
        <div className={styles.loading}>
          <span className={styles.spinner} />
          Thinking through what they actually need…
        </div>
      )}

      {(object?.summary || items.length > 0) && (
        <div className={styles.results}>
          {object?.summary && <div className={styles.summary}>{object.summary}</div>}

          {TIERS.map((t) => {
            const group = items.filter((i) => i?.tier === t.key);
            if (!group.length) return null;
            return (
              <div key={t.key} className={`${styles.tier} ${styles[t.cls]}`}>
                <div className={styles.tierHead}>
                  <span className={styles.tierName}>{t.name}</span>
                  <span className={styles.tierCount}>{group.length}</span>
                </div>
                <div className={styles.tierBlurb}>{t.blurb}</div>
                {group.map((i, idx) => (
                  <div key={idx} className={styles.item}>
                    <div className={styles.itemName}>{i?.name}</div>
                    <div className={styles.itemWhy}>{i?.why}</div>
                    {i?.condition && (
                      <div className={styles.condition}>Only if {i.condition}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          {!isLoading && (
            <div className={styles.actions}>
              <button className={styles.copyBtn} onClick={copyPitch}>
                {copied ? "✓ Copied" : "Copy the pitch"}
              </button>
              <button className={styles.resetBtn} onClick={reset}>Start over</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
