/**
 * Persistence for the visual table survey, keyed by Best Buy store number.
 *
 * Identity = the store number. No login, no geolocation, no tracking.
 *
 * Most reps work the same stores on the same weekdays, so they can save a
 * weekly schedule (Sun..Sat -> store number). The app then just knows where
 * they are. A manual pick always overrides the schedule for that day.
 *
 * localStorage is the offline cache; MongoDB is the permanent home.
 */

import {
  buildDefaultLayout,
  normalizeLayout,
  type TableLayout,
  type ItemCategory,
  CATEGORY_ORDER,
  CATEGORY_RANK,
} from "@/data/table-layout";

// ─── Keys ───────────────────────────────────────────────────────────────────
const ACTIVE_KEY = "sony-active-store";
const KNOWN_KEY = "sony-known-stores";
const SCHEDULE_KEY = "sony-week-schedule";
const LAYOUT_PREFIX = "sony-layout-";
const STOCK_PREFIX = "sony-stock-";
const STOCK_TS_PREFIX = "sony-stock-ts-"; // when the OOS list was last EDITED
const ISSUES_PREFIX = "sony-issues-";

/**
 * Out-of-stock lists are a same-day thing. Nobody should be maintaining
 * yesterday's walk, so a list auto-clears 30 hours after it was last edited
 * (a day plus a buffer for closing/opening shifts). Display issues do NOT
 * expire — a broken camera stays broken until someone fixes it.
 */
export const STOCK_TTL_MS = 30 * 60 * 60 * 1000;
export const STOCK_TTL_HOURS = 30;

// ─── Types ──────────────────────────────────────────────────────────────────
export interface StoreRef {
  number: string; // always 4 digits, e.g. "0180"
  nickname?: string;
}

export interface ActiveStore {
  number: string;
  date: string; // YYYY-MM-DD (local) it was chosen
}

/** Sun..Sat. "" means no store that day. */
export type WeekSchedule = [string, string, string, string, string, string, string];

export const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export interface IssueFlags {
  alarm?: boolean;
  noPower?: boolean;
  broken?: boolean;
  missing?: boolean;
}

export type StockMap = Record<string, boolean>;
export type IssuesMap = Record<string, IssueFlags>;

const hasWindow = () => typeof window !== "undefined";
function read<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown): void {
  if (!hasWindow()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

/** Local YYYY-MM-DD. */
export function todayStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** "58" -> "0058". Digits only, max 4, zero-padded. "" if empty. */
export function normalizeStoreNumber(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  return digits ? digits.padStart(4, "0") : "";
}

// ─── Weekly schedule ────────────────────────────────────────────────────────
export const EMPTY_SCHEDULE: WeekSchedule = ["", "", "", "", "", "", ""];

export function getSchedule(): WeekSchedule {
  const s = read<WeekSchedule>(SCHEDULE_KEY, EMPTY_SCHEDULE);
  return Array.isArray(s) && s.length === 7 ? s : [...EMPTY_SCHEDULE];
}

export function saveSchedule(schedule: WeekSchedule): void {
  write(SCHEDULE_KEY, schedule.map(normalizeStoreNumber) as WeekSchedule);
}

export function hasSchedule(): boolean {
  return getSchedule().some((n) => n !== "");
}

/** The store this rep is scheduled at today, if any. */
export function scheduledStoreToday(): string | null {
  return getSchedule()[new Date().getDay()] || null;
}

// ─── Store of the day ───────────────────────────────────────────────────────
export function getActiveStore(): ActiveStore | null {
  return read<ActiveStore | null>(ACTIVE_KEY, null);
}

/** True only if a store was already chosen today (manual picks win for the day). */
export function isStoreFresh(): boolean {
  const a = getActiveStore();
  return !!a && a.date === todayStr();
}

export function setActiveStore(ref: StoreRef): void {
  write(ACTIVE_KEY, { number: ref.number, date: todayStr() });
  upsertKnownStore(ref);
}

// ─── Known stores (quick-pick list) ─────────────────────────────────────────
export function getKnownStores(): StoreRef[] {
  return read<StoreRef[]>(KNOWN_KEY, []);
}

export function upsertKnownStore(ref: StoreRef): void {
  const list = getKnownStores();
  const i = list.findIndex((s) => s.number === ref.number);
  if (i >= 0) list[i] = { ...list[i], ...ref };
  else list.push(ref);
  list.sort((a, b) => a.number.localeCompare(b.number));
  write(KNOWN_KEY, list);
}

// ─── Layout (default + per-store overrides) ─────────────────────────────────
export function getLayout(storeNumber: string): TableLayout {
  const override = read<TableLayout | null>(LAYOUT_PREFIX + storeNumber, null);
  // Always re-apply the sort rule, so a layout saved under an older rule
  // still comes back in body -> kit -> lens -> accessory order.
  return normalizeLayout(override ?? buildDefaultLayout());
}
export function saveLayout(storeNumber: string, layout: TableLayout): void {
  write(LAYOUT_PREFIX + storeNumber, layout);
}
export function hasLayoutOverride(storeNumber: string): boolean {
  return read<TableLayout | null>(LAYOUT_PREFIX + storeNumber, null) !== null;
}
export function resetLayout(storeNumber: string): void {
  if (hasWindow()) localStorage.removeItem(LAYOUT_PREFIX + storeNumber);
}

/**
 * Wipe every trace of the toolkit from this device: schedule, stores, layouts,
 * marks, caches. Store data in the cloud is untouched — enter the store number
 * again and it all comes back.
 */
export function clearDeviceData(): void {
  if (!hasWindow()) return;
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("sony-")) doomed.push(k);
  }
  doomed.forEach((k) => localStorage.removeItem(k));
}

// ─── Stock + Issues ─────────────────────────────────────────────────────────
export function getStock(storeNumber: string): StockMap {
  return read<StockMap>(STOCK_PREFIX + storeNumber, {});
}
/** Save the OOS map only. Does NOT touch the edit timestamp — see recordStockEdit. */
export function saveStock(storeNumber: string, map: StockMap): void {
  write(STOCK_PREFIX + storeNumber, map);
}

/**
 * Stamp the OOS list as edited-now. Called only on a genuine user toggle, never
 * on the load-time rewrites — otherwise every page load would refresh the clock
 * and the list would never expire.
 */
export function recordStockEdit(storeNumber: string): void {
  write(STOCK_TS_PREFIX + storeNumber, Date.now());
}
export function getStockEditedAt(storeNumber: string): number | null {
  return read<number | null>(STOCK_TS_PREFIX + storeNumber, null);
}
export function clearStockTs(storeNumber: string): void {
  if (hasWindow()) localStorage.removeItem(STOCK_TS_PREFIX + storeNumber);
}
/** True if an OOS list edited at `editedAt` is past its 30-hour life. */
export function stockIsStale(editedAt: number | null): boolean {
  return editedAt != null && Date.now() - editedAt > STOCK_TTL_MS;
}
export function getIssues(storeNumber: string): IssuesMap {
  return read<IssuesMap>(ISSUES_PREFIX + storeNumber, {});
}
export function saveIssues(storeNumber: string, map: IssuesMap): void {
  write(ISSUES_PREFIX + storeNumber, map);
}

// ─── Cloud sync (store-number keyed, no auth) ───────────────────────────────
export interface CloudState {
  store: StoreRef;
  layout: TableLayout | null; // null = shipped default planogram
  stock: StockMap;
  /** ISO timestamp of the OOS list's last write — used for 30h expiry. */
  stockUpdatedAt: string | null;
  issues: IssuesMap;
}

export async function fetchStores(): Promise<StoreRef[]> {
  try {
    const res = await fetch("/api/stores", { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as StoreRef[];
  } catch {
    return [];
  }
}

export async function fetchStoreState(number: string): Promise<CloudState | null> {
  try {
    const res = await fetch(`/api/stores/${encodeURIComponent(number)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as CloudState;
  } catch {
    return null;
  }
}

function push(url: string, method: string, body?: unknown): void {
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch((err) => console.error("Cloud sync failed:", err));
}

export function pushStore(ref: StoreRef): void {
  push("/api/stores", "POST", ref);
}
export function pushLayout(number: string, layout: TableLayout): void {
  push(`/api/stores/${encodeURIComponent(number)}/layout`, "PUT", layout);
}
export function pushLayoutReset(number: string): void {
  push(`/api/stores/${encodeURIComponent(number)}/layout`, "DELETE");
}
export function pushStock(number: string, stock: StockMap): void {
  push(`/api/stores/${encodeURIComponent(number)}/stock`, "PUT", stock);
}
export function pushIssues(number: string, issues: IssuesMap): void {
  push(`/api/stores/${encodeURIComponent(number)}/issues`, "PUT", issues);
}

export function mergeKnownStores(remote: StoreRef[]): StoreRef[] {
  for (const r of remote) upsertKnownStore(r);
  return getKnownStores();
}

// ─── Catalog for the Edit-mode search ───────────────────────────────────────
export interface CatalogEntry {
  label: string;
  model: string;
  sku: string;
  category: ItemCategory;
}

/**
 * One flat, searchable list of everything on the table. Deliberately NOT split
 * by category: a rep should be able to open the sheet and type "55-210"
 * straight away, without picking "lens" first. The category rides along with
 * the entry, so the slot still sorts itself correctly on drop.
 *
 * Pass the store's current layout and anything they've added themselves shows
 * up too — add the A7 VI once, then place it anywhere without retyping it.
 */
export function buildCatalog(storeLayout?: TableLayout | null): CatalogEntry[] {
  const seen = new Map<string, CatalogEntry>();

  const add = (e: CatalogEntry) => {
    const key = `${e.category}|${e.label}`;
    const existing = seen.get(key);
    // A later entry can fill in a model/SKU the earlier one was missing.
    if (!existing) seen.set(key, e);
    else seen.set(key, { ...existing, model: existing.model || e.model, sku: existing.sku || e.sku });
  };

  const harvest = (l: TableLayout) => {
    for (const sec of [l.faces.left, l.faces.center, l.faces.right, ...l.totem])
      for (const slot of sec.slots)
        for (const it of slot.items)
          add({ label: it.label, model: it.model, sku: it.sku ?? "", category: it.category });
  };

  harvest(buildDefaultLayout());
  if (storeLayout) harvest(storeLayout);

  add({ label: "Display Box", model: "", sku: "", category: "display" });
  add({ label: "Demo Tablet", model: "", sku: "", category: "tablet" });

  return [...seen.values()].sort(
    (a, b) =>
      CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category] ||
      a.label.localeCompare(b.label)
  );
}

/** Category list for the "Add New" type picker. */
export const CATEGORIES = CATEGORY_ORDER;
