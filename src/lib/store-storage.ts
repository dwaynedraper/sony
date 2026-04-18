/**
 * localStorage helper functions for per-store issue tracking.
 *
 * Keys:
 *   "sony-toolkit-stores"         → string[]  (store IDs like "0058")
 *   "sony-toolkit-active-store"   → string    (last-used store ID)
 *   "sony-toolkit-issues-{id}"    → StoreIssueData
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CameraIssues {
  alarm: boolean;
  noPower: boolean;
  broken: boolean;
  missing: boolean;
  other: string; // empty string = no "other" issue
}

export interface StoreIssueData {
  cameras: Record<string, CameraIssues>;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

export function emptyIssues(): CameraIssues {
  return { alarm: false, noPower: false, broken: false, missing: false, other: "" };
}

export function hasAnyIssue(issues: CameraIssues): boolean {
  return (
    issues.alarm ||
    issues.noPower ||
    issues.broken ||
    issues.missing ||
    issues.other.trim().length > 0
  );
}

export function issueCount(issues: CameraIssues): number {
  let count = 0;
  if (issues.alarm) count++;
  if (issues.noPower) count++;
  if (issues.broken) count++;
  if (issues.missing) count++;
  if (issues.other.trim().length > 0) count++;
  return count;
}

// ─── Store Management ───────────────────────────────────────────────────────

const STORES_KEY = "sony-toolkit-stores";
const ACTIVE_KEY = "sony-toolkit-active-store";
const ISSUES_PREFIX = "sony-toolkit-issues-";

export function getStores(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addStore(id: string): void {
  const stores = getStores();
  if (!stores.includes(id)) {
    stores.push(id);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  }
}

export function removeStore(id: string): void {
  const stores = getStores().filter((s) => s !== id);
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  localStorage.removeItem(ISSUES_PREFIX + id);

  // If we removed the active store, clear it
  if (getActiveStore() === id) {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function getActiveStore(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY) || null;
}

export function setActiveStore(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

// ─── Issue Data ─────────────────────────────────────────────────────────────

export function getStoreIssues(storeId: string): StoreIssueData {
  if (typeof window === "undefined") return { cameras: {} };
  try {
    const raw = localStorage.getItem(ISSUES_PREFIX + storeId);
    return raw ? JSON.parse(raw) : { cameras: {} };
  } catch {
    return { cameras: {} };
  }
}

export function saveStoreIssues(storeId: string, data: StoreIssueData): void {
  localStorage.setItem(ISSUES_PREFIX + storeId, JSON.stringify(data));
}

export function getCameraIssues(
  storeId: string,
  cameraName: string
): CameraIssues {
  const data = getStoreIssues(storeId);
  return data.cameras[cameraName] || emptyIssues();
}

export function saveCameraIssues(
  storeId: string,
  cameraName: string,
  issues: CameraIssues
): void {
  const data = getStoreIssues(storeId);
  if (hasAnyIssue(issues)) {
    data.cameras[cameraName] = issues;
  } else {
    delete data.cameras[cameraName];
  }
  saveStoreIssues(storeId, data);
}

export function clearCameraIssues(
  storeId: string,
  cameraName: string
): void {
  const data = getStoreIssues(storeId);
  delete data.cameras[cameraName];
  saveStoreIssues(storeId, data);
}
