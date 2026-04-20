"use client";

import { useState, useCallback } from "react";
import { cameraList, cameraSections } from "@/data/camera-list";
import {
  getCameraIssues,
  saveCameraIssues,
  clearCameraIssues,
  hasAnyIssue,
  issueCount,
  emptyIssues,
} from "@/lib/store-storage";
import type { CameraIssues, StoreInfo } from "@/lib/store-storage";
import styles from "./display-issues.module.scss";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DisplayIssuesFormProps {
  storeId: string;
  storeInfo?: StoreInfo;
  onEditStore: () => void;
}

interface ModalState {
  cameraName: string;
  issues: CameraIssues;
}

// ─── Paragraph Generation Helpers ───────────────────────────────────────────

function formatList(names: string[]): string {
  if (names.length === 1) return `The ${names[0]}`;
  if (names.length === 2) return `The ${names[0]} and ${names[1]}`;
  return `The ${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function generateParagraph(
  storeId: string,
  issueMap: Record<string, CameraIssues>
): string {
  const alarmCams: string[] = [];
  const noPowerCams: string[] = [];
  const brokenCams: string[] = [];
  const missingCams: string[] = [];
  const otherCams: { name: string; text: string }[] = [];

  for (const cam of cameraList) {
    const issues = issueMap[cam];
    if (!issues) continue;
    if (issues.alarm) alarmCams.push(cam);
    if (issues.noPower) noPowerCams.push(cam);
    if (issues.broken) brokenCams.push(cam);
    if (issues.missing) missingCams.push(cam);
    if (issues.other.trim()) otherCams.push({ name: cam, text: issues.other.trim() });
  }

  const sentences: string[] = [];

  if (alarmCams.length > 0) {
    const subj = formatList(alarmCams);
    const verb = alarmCams.length === 1 ? "is" : "are";
    sentences.push(`${subj} ${verb} having alarm issues.`);
  }

  if (noPowerCams.length > 0) {
    const subj = formatList(noPowerCams);
    const verb = noPowerCams.length === 1 ? "doesn't" : "don't";
    sentences.push(`${subj} ${verb} power on currently.`);
  }

  if (brokenCams.length > 0) {
    const subj = formatList(brokenCams);
    const verb = brokenCams.length === 1 ? "is" : "are";
    sentences.push(`${subj} ${verb} broken.`);
  }

  if (missingCams.length > 0) {
    const subj = formatList(missingCams);
    const verb = missingCams.length === 1 ? "is" : "are";
    sentences.push(`${subj} ${verb} missing from the display.`);
  }

  for (const { name, text } of otherCams) {
    sentences.push(`The ${name} has the following issue: ${text}.`);
  }

  if (sentences.length === 0) {
    return `Store BBUY${storeId} - All camera displays are functioning normally.`;
  }

  return `Store BBUY${storeId} - ${sentences.join(" ")}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DisplayIssuesForm({
  storeId,
  storeInfo,
  onEditStore,
}: DisplayIssuesFormProps) {
  // Load all camera issues from localStorage on mount
  const loadIssueMap = useCallback((): Record<string, CameraIssues> => {
    const map: Record<string, CameraIssues> = {};
    for (const cam of cameraList) {
      const issues = getCameraIssues(storeId, cam);
      if (hasAnyIssue(issues)) {
        map[cam] = issues;
      }
    }
    return map;
  }, [storeId]);

  const [issueMap, setIssueMap] = useState<Record<string, CameraIssues>>(loadIssueMap);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  // ─── Modal Handlers ─────────────────────────────────────────────────────

  const openModal = (cameraName: string) => {
    const issues = issueMap[cameraName] || emptyIssues();
    setModal({ cameraName, issues: { ...issues } });
  };

  const closeModal = () => setModal(null);

  const updateModalIssue = (field: keyof CameraIssues, value: boolean | string) => {
    if (!modal) return;
    setModal({
      ...modal,
      issues: { ...modal.issues, [field]: value },
    });
  };

  const saveModal = () => {
    if (!modal) return;
    saveCameraIssues(storeId, modal.cameraName, modal.issues);

    // Update local state
    const newMap = { ...issueMap };
    if (hasAnyIssue(modal.issues)) {
      newMap[modal.cameraName] = modal.issues;
    } else {
      delete newMap[modal.cameraName];
    }
    setIssueMap(newMap);
    closeModal();
  };

  // ─── Actions ────────────────────────────────────────────────────────────

  const handleRepair = (cameraName: string) => {
    clearCameraIssues(storeId, cameraName);
    const newMap = { ...issueMap };
    delete newMap[cameraName];
    setIssueMap(newMap);
  };

  const handleGenerate = () => {
    setOutput(generateParagraph(storeId, issueMap));
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  // ─── Issue badge icons ──────────────────────────────────────────────────

  const issueBadges = (issues: CameraIssues) => {
    const badges: { icon: string; label: string }[] = [];
    if (issues.alarm) badges.push({ icon: "🔔", label: "Alarm" });
    if (issues.noPower) badges.push({ icon: "⚡", label: "No Power" });
    if (issues.broken) badges.push({ icon: "🔨", label: "Broken" });
    if (issues.missing) badges.push({ icon: "❌", label: "Missing" });
    if (issues.other.trim()) badges.push({ icon: "📝", label: "Other" });
    return badges;
  };

  // Count total cameras with issues
  const totalIssueCount = Object.keys(issueMap).length;

  // ─── JSX ────────────────────────────────────────────────────────────────

  const formattedStoreNum = `Store #${parseInt(storeId.replace(/\D/g, ""), 10)}`;
  const storeIdentifier = storeInfo?.nickname || formattedStoreNum;
  
  const addressParts = storeInfo?.address?.split(", ") || [];
  const addressLine1 = addressParts[0];
  const addressLine2 = addressParts.slice(1).join(", ");

  return (
    <div className={styles.formWrapper}>
      {/* Header */}
      <div className={styles.formHeader}>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-4">
            Display Issues
          </h1>
          
          <div className={styles.storeAddressBlock}>
            <div className={styles.storeAddressNickname}>{storeIdentifier}</div>
            {storeInfo?.nickname && <div className={styles.storeAddressNumber}>{formattedStoreNum}</div>}
            {addressLine1 && <div className={styles.storeAddressText}>{addressLine1}</div>}
            {addressLine2 && <div className={styles.storeAddressText}>{addressLine2}</div>}
          </div>
        </div>

        <div className={styles.headerRight}>
          {totalIssueCount > 0 && (
            <span className={styles.issueCounter}>
              {totalIssueCount} {totalIssueCount === 1 ? "issue" : "issues"}
            </span>
          )}
          <button
            type="button"
            onClick={onEditStore}
            className={styles.editStoreBtn}
          >
            Edit store info
          </button>
        </div>
      </div>

      <p className="text-sm text-text-muted mb-4">
        Tap a camera to report issues. Data is saved automatically per store.
      </p>

      {/* Camera Display — Left / Center / Right */}
      <div className={styles.displayLayout}>
        {cameraSections.map((section) => (
          <div key={section.id} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <div className={styles.sectionGrid}>
              {section.cameras.map((cam) => {
                const issues = issueMap[cam];
                const hasIssues = !!issues;
                const badges = hasIssues ? issueBadges(issues) : [];

                return (
                  <button
                    key={cam}
                    type="button"
                    onClick={() => openModal(cam)}
                    className={`${styles.cameraCard} ${hasIssues ? styles.cameraCardIssue : ""}`}
                    aria-label={`${cam}: ${hasIssues ? `${issueCount(issues)} issues` : "no issues"}. Tap to edit.`}
                  >
                    <span className={styles.cameraName}>{cam}</span>
                    <div className={styles.cardRight}>
                      {hasIssues ? (
                        <>
                          <div className={styles.badgeRow}>
                            {badges.map((b) => (
                              <span
                                key={b.label}
                                className={styles.issueBadge}
                                title={b.label}
                              >
                                {b.icon}
                              </span>
                            ))}
                          </div>
                          <span
                            className={styles.repairBtn}
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRepair(cam);
                            }}
                          >
                            🔧 Mark Fixed
                          </span>
                        </>
                      ) : (
                        <span className={styles.okBadge}>✓ OK</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionButtons}>
          <button
            type="button"
            onClick={handleGenerate}
            className={styles.btnPrimary}
          >
            Generate Report
          </button>
        </div>

        {output && (
          <div className={styles.outputArea}>
            <p className={styles.outputText}>{output}</p>
            <button
              type="button"
              onClick={handleCopy}
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
          aria-label={`${modal.cameraName} issues`}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modal.cameraName}</h2>
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
              {/* Checkbox issues */}
              {(
                [
                  { key: "alarm" as const, icon: "🔔", label: "Alarm Issues" },
                  { key: "noPower" as const, icon: "⚡", label: "No Power" },
                  { key: "broken" as const, icon: "🔨", label: "Broken" },
                  { key: "missing" as const, icon: "❌", label: "Missing" },
                ] as const
              ).map(({ key, icon, label }) => (
                <label key={key} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={modal.issues[key]}
                    onChange={(e) => updateModalIssue(key, e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>
                    <span className={styles.checkboxLabelName}>
                      {icon} {label}
                    </span>
                  </span>
                </label>
              ))}

              {/* Other — free text */}
              <div className={styles.otherSection}>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={modal.issues.other.trim().length > 0}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        updateModalIssue("other", "");
                      }
                    }}
                    className={styles.checkbox}
                    readOnly={modal.issues.other.trim().length > 0}
                  />
                  <span className={styles.checkboxLabel}>
                    <span className={styles.checkboxLabelName}>
                      📝 Other
                    </span>
                  </span>
                </label>
                <textarea
                  value={modal.issues.other}
                  onChange={(e) => updateModalIssue("other", e.target.value)}
                  placeholder="Describe the issue..."
                  rows={2}
                  className={styles.otherInput}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={saveModal}
                className={styles.btnPrimary}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
