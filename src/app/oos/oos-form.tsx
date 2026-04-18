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

  // Count how many options are checked in a given slot
  const slotCheckedCount = (sectionId: string, slotIdx: number, slot: DisplaySlot) =>
    slot.options.filter((_, optIdx) => checked[optionKey(sectionId, slotIdx, optIdx)]).length;

  // Toggle a single option
  const toggleOption = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Open modal for a slot
  const openModal = (section: DisplaySection, slotIndex: number) => {
    const slot = section.slots[slotIndex];
    if (slot.options.length === 0) return; // display-only slots
    setModal({ section, slotIndex, slot });
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

  const renderSlotCard = (section: DisplaySection, slotIdx: number) => {
    const slot = section.slots[slotIdx];
    const isInteractive = slot.options.length > 0;
    const count = isInteractive ? slotCheckedCount(section.id, slotIdx, slot) : 0;
    const total = slot.options.length;

    return (
      <button
        key={`${section.id}-${slotIdx}`}
        type="button"
        disabled={!isInteractive}
        onClick={() => openModal(section, slotIdx)}
        className={`${styles.slotCard} ${
          !isInteractive ? styles.slotCardDisabled : ""
        } ${count > 0 ? styles.slotCardActive : ""}`}
        aria-label={
          isInteractive
            ? `${slot.name}: ${count} of ${total} checked. Tap to edit.`
            : `${slot.name}: display only`
        }
      >
        <span className={styles.slotName}>{slot.name}</span>
        {isInteractive && (
          <span className={styles.slotBadge}>
            {count > 0 ? `${count}/${total}` : total}
          </span>
        )}
        {!isInteractive && (
          <span className={styles.slotLabel}>Display Only</span>
        )}
      </button>
    );
  };

  const renderSection = (section: DisplaySection) => (
    <div key={section.id} className={styles.section}>
      <h3 className={styles.sectionTitle}>{section.title}</h3>
      <div className={styles.sectionGrid}>
        {section.slots.map((_, idx) => renderSlotCard(section, idx))}
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

      {/* Modal */}
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
              {modal.slot.options.map((opt, optIdx) => {
                const key = optionKey(
                  modal.section.id,
                  modal.slotIndex,
                  optIdx
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
