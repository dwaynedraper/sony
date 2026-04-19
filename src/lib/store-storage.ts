/**
 * localStorage helper functions for per-store issue tracking.
 *
 * Keys:
 *   "sony-toolkit-stores"         → StoreInfo[]  (store metadata)
 *   "sony-toolkit-active-store"   → string       (last-used store ID)
 *   "sony-toolkit-issues-{id}"    → StoreIssueData
 *   "sony-toolkit-geo-denied"     → "true" if user declined geolocation
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StoreInfo {
  id: string;           // "0058" — required, the index
  nickname?: string;    // "Willowbrook" — optional display name
  address?: string;     // "7500 S Cass Ave, Darien, IL" — optional
  lat?: number;         // latitude from geocoding
  lng?: number;         // longitude from geocoding
}

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

// ─── Keys ───────────────────────────────────────────────────────────────────

const STORES_KEY = "sony-toolkit-stores";
const ACTIVE_KEY = "sony-toolkit-active-store";
const ISSUES_PREFIX = "sony-toolkit-issues-";
const GEO_DENIED_KEY = "sony-toolkit-geo-denied";

// ─── Migration ──────────────────────────────────────────────────────────────

/**
 * Detects the old string[] format and migrates to StoreInfo[].
 * Called once on mount.
 */
function migrateIfNeeded(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORES_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return;

    // Old format: string[], new format: StoreInfo[]
    if (typeof parsed[0] === "string") {
      const migrated: StoreInfo[] = parsed.map((id: string) => ({ id }));
      localStorage.setItem(STORES_KEY, JSON.stringify(migrated));
    }
  } catch {
    // Corrupted data — start fresh
    localStorage.removeItem(STORES_KEY);
  }
}

// Run migration on module load (client-side only)
if (typeof window !== "undefined") {
  migrateIfNeeded();
}

// ─── Store Management ───────────────────────────────────────────────────────

export function getStoreList(): StoreInfo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Backward-compatible: returns just the IDs */
export function getStores(): string[] {
  return getStoreList().map((s) => s.id);
}

export function getStoreInfo(id: string): StoreInfo | undefined {
  return getStoreList().find((s) => s.id === id);
}

/** Returns the display label for a store: nickname if set, else "BBUY{id}" */
export function getStoreLabel(info: StoreInfo): string {
  return info.nickname?.trim() || `BBUY${info.id}`;
}

export function addStore(info: StoreInfo): void {
  const list = getStoreList();
  if (!list.some((s) => s.id === info.id)) {
    list.push(info);
    localStorage.setItem(STORES_KEY, JSON.stringify(list));
  }
}

export function updateStoreInfo(info: StoreInfo): void {
  const list = getStoreList();
  const idx = list.findIndex((s) => s.id === info.id);
  if (idx >= 0) {
    list[idx] = info;
  } else {
    list.push(info);
  }
  localStorage.setItem(STORES_KEY, JSON.stringify(list));
}

export function removeStore(id: string): void {
  const list = getStoreList().filter((s) => s.id !== id);
  localStorage.setItem(STORES_KEY, JSON.stringify(list));
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

// ─── Geolocation Preference ────────────────────────────────────────────────

export function isGeoDenied(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(GEO_DENIED_KEY) === "true";
}

export function setGeoDenied(denied: boolean): void {
  if (denied) {
    localStorage.setItem(GEO_DENIED_KEY, "true");
  } else {
    localStorage.removeItem(GEO_DENIED_KEY);
  }
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

// ─── Geolocation Helpers ────────────────────────────────────────────────────

/** Haversine distance in km between two lat/lng pairs */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find the nearest store with lat/lng to the given position, if within maxDistKm */
export function findNearestStore(
  lat: number,
  lng: number,
  stores: StoreInfo[],
  maxDistKm: number = 50 // Roughly 30 miles
): StoreInfo | null {
  let nearest: StoreInfo | null = null;
  let minDist = Infinity;

  for (const store of stores) {
    if (store.lat != null && store.lng != null) {
      const dist = haversineDistance(lat, lng, store.lat, store.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = store;
      }
    }
  }

  // Only return the nearest store if it's within our reasonable radius
  return minDist <= maxDistKm ? nearest : null;
}
