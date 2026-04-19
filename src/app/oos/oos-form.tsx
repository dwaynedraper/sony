"use client";

import { useState, useCallback } from "react";
import { cameraDisplay, lensTotem } from "@/data/display-slots";
import type { DisplaySlot, DisplaySection } from "@/data/display-slots";
import styles from "./oos.module.scss";

// ─── Types ──────────────────────────────────────────────────────────────────

/** Key = "sectionId:slotIndex:optionIndex" */
type CheckedMap = Record<string, boolean>;

interface ModalState {
  section: DisplaySection;
  slotIndex: number;
  slot: DisplaySlot;
  /** Only the camera-body options (filtered) */
  cameraOptions: { label: string; model: string; originalIdx: number }[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns true if the option is a lens/accessory (not a camera body/kit) */
function isLensOrAccessory(model: string): boolean {
  return model.startsWith("SEL") || model.startsWith("ECM");
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function OosForm() {
  const [checked, setChecked] = useState<CheckedMap>({});
  const [modal, setModal] = useState<ModalState | null>(null);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  // Build a unique key for each option
  const optionKey = (sectionId: string, slotIdx: number, optIdx: number) =>
    `${sectionId}:${slotIdx}:${optIdx}`;

  // Toggle a single option
  const toggleOption = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle camera card tap
  const handleCameraTap = (section: DisplaySection, slotIndex: number) => {
    const slot = section.slots[slotIndex];

    // Get only camera-body options (not lenses/accessories)
    const cameraOptions = slot.options
      .map((opt, idx) => ({ ...opt, originalIdx: idx }))
      .filter((opt) => !isLensOrAccessory(opt.model));

    if (cameraOptions.length === 0) return;

    if (cameraOptions.length === 1) {
      // Single camera option — toggle directly
      toggleOption(optionKey(section.id, slotIndex, cameraOptions[0].originalIdx));
      return;
    }

    // Multiple camera options — open modal
    setModal({ section, slotIndex, slot, cameraOptions });
  };

  // Close modal
  const closeModal = () => setModal(null);

  // Generate the output string
  const generate = useCallback(() => {
    const parts: string[] = [];

    // Camera display sections
    for (const section of cameraDisplay) {
      for (let si = 0; si < section.slots.length; si++) {
        const slot = section.slots[si];
        for (let oi = 0; oi < slot.options.length; oi++) {
          if (checked[optionKey(section.id, si, oi)]) {
            const opt = slot.options[oi];
            parts.push(`${opt.label} (${opt.model})`);
          }
        }
      }
    }

    // Lens totem rows
    for (const section of lensTotem) {
      for (let si = 0; si < section.slots.length; si++) {
        const slot = section.slots[si];
        for (let oi = 0; oi < slot.options.length; oi++) {
          if (checked[optionKey(section.id, si, oi)]) {
            const opt = slot.options[oi];
            parts.push(`${opt.label} (${opt.model})`);
          }
        }
      }
    }

    setOutput(parts.join(", "));
  }, [checked]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Clear all selections
  const clearAll = () => {
    setChecked({});
    setOutput("");
    setCopied(false);
  };

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderSlotCards = (section: DisplaySection, slotIdx: number) => {
    const slot = section.slots[slotIdx];

    // Split into camera options and lens/accessory options
    const cameraOpts = slot.options
      .map((opt, idx) => ({ ...opt, originalIdx: idx }))
      .filter((opt) => !isLensOrAccessory(opt.model));
    const lensOpts = slot.options
      .map((opt, idx) => ({ ...opt, originalIdx: idx }))
      .filter((opt) => isLensOrAccessory(opt.model));

    const isDisplayOnly = slot.options.length === 0;
    const cameraCheckedCount = cameraOpts.filter(
      (o) => checked[optionKey(section.id, slotIdx, o.originalIdx)]
    ).length;

    const cards: React.ReactNode[] = [];

    // ── Camera card ──
    if (isDisplayOnly) {
      // Display-only slot (no options at all)
      cards.push(
        <button
          key={`${section.id}-${slotIdx}`}
          type="button"
          disabled
          className={`${styles.slotCard} ${styles.slotCardDisabled}`}
          aria-label={`${slot.name}: display only`}
        >
          <span className={styles.slotName}>{slot.name}</span>
          <span className={styles.slotLabel}>Display Only</span>
        </button>
      );
    } else if (cameraOpts.length > 0) {
      // Has camera options
      const totalCam = cameraOpts.length;
      cards.push(
        <button
          key={`${section.id}-${slotIdx}`}
          type="button"
          onClick={() => handleCameraTap(section, slotIdx)}
          className={`${styles.slotCard} ${styles.slotCardCamera} ${
            cameraCheckedCount > 0 ? styles.slotCardActive : ""
          }`}
          aria-label={`${slot.name}: ${cameraCheckedCount} of ${totalCam} checked. Tap to edit.`}
        >
          <span className={styles.slotName}>{slot.name}</span>
          <span className={styles.slotBadge}>
            {cameraCheckedCount > 0 ? `${cameraCheckedCount}/${totalCam}` : totalCam}
          </span>
        </button>
      );
    }

    // ── Lens/accessory cards (each rendered individually, right after the camera) ──
    for (const lensOpt of lensOpts) {
      const key = optionKey(section.id, slotIdx, lensOpt.originalIdx);
      const isChecked = !!checked[key];

      cards.push(
        <button
          key={key}
          type="button"
          onClick={() => toggleOption(key)}
          className={`${styles.slotCard} ${styles.slotCardLens} ${
            isChecked ? styles.slotCardActive : ""
          }`}
          aria-label={`${lensOpt.label}: ${isChecked ? "checked" : "unchecked"}. Tap to toggle.`}
        >
          <span className={styles.slotName}>{lensOpt.label}</span>
          {isChecked && <span className={styles.slotCheckmark}>✓</span>}
        </button>
      );
    }

    return cards;
  };

  const renderSection = (section: DisplaySection) => (
    <div key={section.id} className={styles.section}>
      <h3 className={styles.sectionTitle}>{section.title}</h3>
      <div className={styles.sectionGrid}>
        {section.slots.flatMap((_, idx) => renderSlotCards(section, idx))}
      </div>
    </div>
  );

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Out of Stock
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Tap a slot to mark items as out of stock. Then generate &amp; copy.
        </p>
      </div>

      {/* Camera Display Grid */}
      <div className={styles.displayLayout}>
        {cameraDisplay.map(renderSection)}
      </div>

      {/* Lens Totem Rows */}
      {lensTotem.length > 0 && (
        <div className={styles.lensTotemLayout}>
          {lensTotem.map(renderSection)}
        </div>
      )}

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionButtons}>
          <button
            type="button"
            onClick={generate}
            className={styles.btnPrimary}
          >
            Generate OOS List
          </button>
          <button
            type="button"
            onClick={clearAll}
            className={styles.btnSecondary}
          >
            Clear All
          </button>
        </div>

        {output && (
          <div className={styles.outputArea}>
            <p className={styles.outputText}>{output}</p>
            <button
              type="button"
              onClick={copyToClipboard}
              className={`${styles.btnCopy} ${copied ? styles.btnCopied : ""}`}
            >
              {copied ? "✓ Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        )}
      </div>

      {/* Modal — only for multi-option camera slots */}
      {modal && (
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={`${modal.slot.name} options`}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modal.slot.name}</h2>
              <button
                type="button"
                onClick={closeModal}
                className={styles.modalClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {modal.cameraOptions.map((opt) => {
                const key = optionKey(
                  modal.section.id,
                  modal.slotIndex,
                  opt.originalIdx
                );
                const isChecked = !!checked[key];

                return (
                  <label key={key} className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOption(key)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxLabel}>
                      <span className={styles.checkboxLabelName}>
                        {opt.label}
                      </span>
                      <span className={styles.checkboxLabelModel}>
                        {opt.model}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={closeModal}
                className={styles.btnPrimary}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
