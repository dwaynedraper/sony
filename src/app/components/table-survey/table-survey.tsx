"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  sortItems,
  normalizeLayout,
  CATEGORY_LABELS,
  type TableLayout,
  type TableSection,
  type ItemCategory,
} from "@/data/table-layout";
import {
  isStoreFresh,
  getActiveStore,
  setActiveStore,
  getKnownStores,
  getSchedule,
  saveSchedule,
  hasSchedule,
  scheduledStoreToday,
  normalizeStoreNumber,
  DAY_LETTERS,
  getLayout,
  saveLayout,
  resetLayout,
  hasLayoutOverride,
  getStock,
  saveStock,
  getIssues,
  saveIssues,
  buildCatalog,
  CATEGORIES,
  type CatalogEntry,
  fetchStores,
  fetchStoreState,
  mergeKnownStores,
  pushStore,
  pushLayout,
  pushLayoutReset,
  pushStock,
  pushIssues,
  type StoreRef,
  type StockMap,
  type IssuesMap,
  type WeekSchedule,
} from "@/lib/table-store";
import styles from "./table-survey.module.scss";

type Mode = "stock" | "issues";
type SideKey = "left" | "center" | "right";
type SectionKey = SideKey | "totem";

/** Which section an edit targets: a camera face, or a lens-totem row. */
type SecRef = { type: "face"; side: SideKey } | { type: "totem"; row: number };

interface EditorState {
  kind: "edit" | "add";
  sec: SecRef;
  /** -1 on a totem "add" means: append a brand-new slot to the row. */
  slotIdx: number;
  itemIdx: number | null;
  cat: ItemCategory | null;
}

const ISSUE_FLAGS = [
  { key: "alarm", label: "Alarm" },
  { key: "noPower", label: "No Power" },
  { key: "broken", label: "Broken" },
  { key: "missing", label: "Missing" },
] as const;
type FlagKey = (typeof ISSUE_FLAGS)[number]["key"];

const sectionOf = (l: TableLayout, s: SecRef): TableSection =>
  s.type === "face" ? l.faces[s.side] : l.totem[s.row];

/** Strip padding zeros so the editor shows what a rep would actually type. */
const toTyped = (n: string) => n.replace(/^0+/, "");

/**
 * A 4-digit store-number field. Placeholder zeros render grey; whatever the rep
 * types renders white and fills from the right: "5" -> 0005, then "58" -> 0058.
 * A typed 0 is white, because it's typed.
 */
function StorePad({
  value, onChange, large,
}: { value: string; onChange: (v: string) => void; large?: boolean }) {
  const zeros = "0".repeat(Math.max(0, 4 - value.length));
  return (
    <label className={`${styles.pad} ${large ? styles.padLarge : ""}`}>
      {zeros && <span className={styles.padZeros}>{zeros}</span>}
      <span className={styles.padDigits}>{value}</span>
      <input
        className={styles.padInput}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      />
    </label>
  );
}

export default function TableSurvey({ mode }: { mode: Mode }) {
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<StoreRef | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerView, setPickerView] = useState<"menu" | "schedule">("menu");
  const [syncing, setSyncing] = useState(false);

  const [layout, setLayout] = useState<TableLayout | null>(null);
  const [stock, setStock] = useState<StockMap>({});
  const [issues, setIssues] = useState<IssuesMap>({});

  const [view, setView] = useState<"overview" | "side" | "totem">("overview");
  const [side, setSide] = useState<SideKey>("left");
  const [done, setDone] = useState<Record<SectionKey, boolean>>({
    left: false, center: false, right: false, totem: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [editorSearch, setEditorSearch] = useState("");
  const [newItem, setNewItem] = useState<{ name: string; cat: ItemCategory | null } | null>(null);
  const [report, setReport] = useState("");
  const [copied, setCopied] = useState(false);

  // The search field stays mounted even when the sheet is closed. That lets us
  // call focus() synchronously inside the tap handler, which is the only way
  // iOS Safari will raise the keyboard for you (WebKit requires a user gesture).
  const searchRef = useRef<HTMLInputElement>(null);

  const [knownStores, setKnownStores] = useState<StoreRef[]>([]);
  const [todayNumber, setTodayNumber] = useState("");
  const [draftSchedule, setDraftSchedule] = useState<WeekSchedule>(["", "", "", "", "", "", ""]);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const catalog = useMemo(() => buildCatalog(), []);
  const todayIdx = new Date().getDay();

  // One list, every category. Type "55-210" (or "55210") and it just finds it —
  // no need to pick "lens" first. Matches label and model, punctuation-insensitive.
  const results = useMemo<CatalogEntry[]>(() => {
    const q = editorSearch.trim().toLowerCase();
    if (!q) return catalog;
    const strip = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
    const qs = strip(q);
    return catalog.filter((e) => {
      const hay = `${e.label} ${e.model}`.toLowerCase();
      return hay.includes(q) || strip(hay).includes(qs);
    });
  }, [catalog, editorSearch]);

  // ── Mount ─────────────────────────────────────────────────────────────────
  // localStorage is client-only, so this can only run after mount. Work happens
  // off the synchronous effect body so we don't cascade renders.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const known = getKnownStores();
      const active = isStoreFresh() ? getActiveStore() : null;
      const scheduled = active ? null : scheduledStoreToday();
      const schedule = getSchedule();
      await Promise.resolve();
      if (cancelled) return;

      setKnownStores(known);
      setDraftSchedule(schedule.map(toTyped) as WeekSchedule);
      setScheduleSaved(hasSchedule());
      setReady(true);

      // A store already picked today wins; otherwise fall back to the schedule.
      const number = active?.number ?? scheduled;
      if (number) {
        await loadStore(known.find((s) => s.number === number) ?? { number });
        return;
      }

      setShowPicker(true);
      const remote = await fetchStores();
      if (!cancelled && remote.length) setKnownStores(mergeKnownStores(remote));
    })();

    return () => { cancelled = true; };
  }, []);

  /** Show cached data instantly, then reconcile with the cloud (cloud wins). */
  async function loadStore(ref: StoreRef) {
    setActiveStore(ref);
    pushStore(ref);
    setStore(ref);
    setLayout(getLayout(ref.number));
    setStock(getStock(ref.number));
    setIssues(getIssues(ref.number));
    setDone({ left: false, center: false, right: false, totem: false });
    setView("overview");
    setShowPicker(false);
    setPickerView("menu");
    setKnownStores(getKnownStores());

    setSyncing(true);
    const cloud = await fetchStoreState(ref.number);
    setSyncing(false);
    if (!cloud) return; // offline — keep the cached copy

    if (cloud.layout) {
      const normalized = normalizeLayout(cloud.layout);
      saveLayout(ref.number, normalized);
      setLayout(normalized);
    } else {
      resetLayout(ref.number);
      setLayout(getLayout(ref.number));
    }
    saveStock(ref.number, cloud.stock);
    setStock(cloud.stock);
    saveIssues(ref.number, cloud.issues);
    setIssues(cloud.issues);
  }

  // ── Picker actions ────────────────────────────────────────────────────────
  function useToday() {
    const num = normalizeStoreNumber(todayNumber);
    if (!num) return;
    setTodayNumber("");
    void loadStore({ number: num });
  }

  function commitSchedule() {
    const normalized = draftSchedule.map(normalizeStoreNumber) as WeekSchedule;
    saveSchedule(normalized);
    setScheduleSaved(hasSchedule());
    setPickerView("menu");

    // If today is covered, drop straight into that store.
    const todays = normalized[todayIdx];
    if (todays) void loadStore(knownStores.find((s) => s.number === todays) ?? { number: todays });
  }

  // ── Mutators (cache first, cloud in the background) ────────────────────────
  function toggleStock(key: string) {
    if (!store) return;
    setStock((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      saveStock(store.number, next);
      pushStock(store.number, next);
      return next;
    });
  }

  function toggleFlag(key: string, flag: FlagKey) {
    if (!store) return;
    setIssues((prev) => {
      const cur = { ...(prev[key] ?? {}) };
      cur[flag] = !cur[flag];
      const next = { ...prev, [key]: cur };
      if (!Object.values(cur).some(Boolean)) delete next[key];
      saveIssues(store.number, next);
      pushIssues(store.number, next);
      return next;
    });
  }

  function updateLayout(mutate: (draft: TableLayout) => void) {
    if (!store || !layout) return;
    const next: TableLayout = structuredClone(layout);
    mutate(next);
    saveLayout(store.number, next);
    pushLayout(store.number, next);
    setLayout(next);
  }

  function restoreDefault() {
    if (!store) return;
    const ok = window.confirm(
      `Restore the default planogram for store #${store.number}?\n\n` +
        `This discards this store's custom layout and cannot be undone. ` +
        `Out-of-stock marks and display issues are not affected.`
    );
    if (!ok) return;
    resetLayout(store.number);
    pushLayoutReset(store.number);
    setLayout(getLayout(store.number));
  }

  // ── Editor ────────────────────────────────────────────────────────────────
  /** Opened from a tap, so focus() here rides the user gesture and iOS obeys. */
  function openEditor(next: EditorState) {
    setEditor(next);
    setEditorSearch("");
    setNewItem(null);
    searchRef.current?.focus();
  }
  function openEdit(sec: SecRef, slotIdx: number, itemIdx: number) {
    const item = sectionOf(layout!, sec).slots[slotIdx].items[itemIdx];
    openEditor({ kind: "edit", sec, slotIdx, itemIdx, cat: item.category });
  }
  function openAdd(sec: SecRef, slotIdx: number) {
    openEditor({ kind: "add", sec, slotIdx, itemIdx: null, cat: null });
  }
  function closeEditor() {
    setEditor(null);
    setNewItem(null);
    searchRef.current?.blur();
  }

  function assignItem(label: string, model: string, cat: ItemCategory) {
    if (!editor) return;
    const { sec, slotIdx, itemIdx, kind } = editor;
    updateLayout((draft) => {
      const section = sectionOf(draft, sec);
      if (kind === "edit" && itemIdx != null) {
        section.slots[slotIdx].items[itemIdx] = { category: cat, label, model };
        sortItems(section.slots[slotIdx]);
      } else if (sec.type === "totem" && slotIdx === -1) {
        section.slots.push({ items: [{ category: cat, label, model }] });
      } else {
        section.slots[slotIdx].items.push({ category: cat, label, model });
        sortItems(section.slots[slotIdx]);
      }
    });
    closeEditor();
  }
  function removeItem() {
    if (!editor || editor.kind !== "edit" || editor.itemIdx == null) return;
    const { sec, slotIdx, itemIdx } = editor;
    updateLayout((draft) => {
      const section = sectionOf(draft, sec);
      const slot = section.slots[slotIdx];
      slot.items.splice(itemIdx, 1);
      if (sec.type === "totem" && slot.items.length === 0) section.slots.splice(slotIdx, 1);
    });
    closeEditor();
  }

  /** Start a custom item, pre-filled with whatever's already typed. */
  function startNewItem() {
    if (!editor) return;
    setNewItem({ name: editorSearch.trim(), cat: editor.kind === "edit" ? editor.cat : null });
  }
  function saveNewItem() {
    if (!newItem?.name.trim() || !newItem.cat) return;
    assignItem(newItem.name.trim(), "", newItem.cat);
  }

  /** A face slot always keeps a camera: hide Remove on the last camera square. */
  function canRemove(): boolean {
    if (!editor || editor.kind !== "edit" || editor.itemIdx == null || !layout) return false;
    if (editor.sec.type === "totem") return true;
    const items = sectionOf(layout, editor.sec).slots[editor.slotIdx].items;
    const it = items[editor.itemIdx];
    return !(it.category === "camera" && items.filter((i) => i.category === "camera").length <= 1);
  }

  // ── Nav ───────────────────────────────────────────────────────────────────
  const openSide = (s: SideKey) => { setSide(s); setEditMode(false); setView("side"); window.scrollTo(0, 0); };
  const openTotem = () => { setEditMode(false); setView("totem"); window.scrollTo(0, 0); };
  const back = () => { setEditMode(false); setEditor(null); setView("overview"); window.scrollTo(0, 0); };
  const toggleComplete = (sec: SectionKey) => { setDone((p) => ({ ...p, [sec]: !p[sec] })); setTimeout(back, 160); };

  // ── Report ────────────────────────────────────────────────────────────────
  function generate() {
    if (!layout) return;
    const sections = [layout.faces.left, layout.faces.center, layout.faces.right, ...layout.totem];
    const parts: string[] = [];
    for (const sec of sections) {
      sec.slots.forEach((slot, si) => {
        if (mode === "stock") {
          slot.items.forEach((it, ii) => {
            if (stock[`${sec.id}:${si}:${ii}`]) parts.push(it.model ? `${it.label} (${it.model})` : it.label);
          });
        } else {
          const flags = issues[`${sec.id}:${si}`];
          if (flags) {
            const cam = slot.items.find((i) => i.category === "camera") ?? slot.items[0];
            const on = ISSUE_FLAGS.filter((f) => flags[f.key]).map((f) => f.label);
            if (cam && on.length) parts.push(`${cam.label}: ${on.join(", ")}`);
          }
        }
      });
    }
    const head = store ? `Store #${store.number} — ` : "";
    setReport(
      parts.length
        ? head + (mode === "stock" ? `Out of stock: ${parts.join(", ")}` : `Display issues:\n${parts.join("\n")}`)
        : `${head}nothing flagged — the table is good.`
    );
    setCopied(false);
  }
  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the text is on screen to copy by hand */
    }
  }

  const count = mode === "stock" ? Object.keys(stock).length : Object.keys(issues).length;
  if (!ready) return null;
  const rootClass = `${styles.root} ${mode === "issues" ? styles.issues : ""}`;

  // ── Store picker (no login, no location) ──────────────────────────────────
  if (showPicker || !store) {
    return (
      <div className={rootClass}>
        <div className={styles.sheet} style={{ borderRadius: 16, border: "1px solid var(--line)", maxWidth: "100%" }}>
          <div className={styles.sheetH}>
            <span>{pickerView === "schedule" ? "Your weekly schedule" : "Which store today?"}</span>
            {store && <button className={styles.sheetX} onClick={() => setShowPicker(false)}>✕</button>}
          </div>

          {pickerView === "schedule" ? (
            <>
              <div className={styles.pickerNote}>
                Set the store you work each day. Leave a day blank if you&apos;re off. The app will just know where
                you are — no location, no login.
              </div>
              <div className={styles.weekGrid}>
                {DAY_LETTERS.map((letter, i) => (
                  <div key={i} className={`${styles.dayCol} ${i === todayIdx ? styles.dayToday : ""}`}>
                    <span className={styles.dayLetter}>{letter}</span>
                    <StorePad
                      value={draftSchedule[i]}
                      onChange={(v) => {
                        const next = [...draftSchedule] as WeekSchedule;
                        next[i] = v;
                        setDraftSchedule(next);
                      }}
                    />
                  </div>
                ))}
              </div>
              <button className={styles.primaryBtn} onClick={commitSchedule}>Save schedule</button>
              <div style={{ height: 8 }} />
              <button className={styles.ghostBtn} onClick={() => setPickerView("menu")}>Cancel</button>
            </>
          ) : (
            <>
              {!scheduleSaved ? (
                <div className={styles.schedulePrompt}>
                  <p>Work the same stores every week? Save your schedule once and the app will know where you are
                    each day — no location, no login.</p>
                  <button className={styles.primaryBtn} onClick={() => setPickerView("schedule")}>
                    Set my schedule
                  </button>
                </div>
              ) : (
                <button className={styles.ghostBtn} onClick={() => setPickerView("schedule")}>
                  ✎ Edit weekly schedule
                </button>
              )}

              <div className={styles.sectionLabel}>Just today</div>
              <div className={styles.todayRow}>
                <StorePad value={todayNumber} onChange={setTodayNumber} large />
                <button onClick={useToday}>Go</button>
              </div>

              {knownStores.length > 0 && (
                <>
                  <div className={styles.sectionLabel}>Recent stores</div>
                  <div className={styles.knownList}>
                    {knownStores.map((s) => (
                      <div key={s.number} className={styles.knownRow} onClick={() => void loadStore(s)}>
                        <span>#{s.number}{s.nickname ? ` · ${s.nickname}` : ""}</span>
                        <small>use</small>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  const secRef: SecRef = { type: "face", side };

  return (
    <div className={rootClass}>
      <div className={styles.header}>
        <div className={styles.storeBar}>
          <div className={styles.storeName}>
            Store #{store.number}{store.nickname && <span>{store.nickname}</span>}
            {syncing && <span>syncing…</span>}
          </div>
          <button className={styles.changeBtn} onClick={() => { setPickerView("menu"); setShowPicker(true); }}>
            Change
          </button>
        </div>
      </div>

      {view === "overview" && (
        <>
          <div className={styles.h1}>{mode === "stock" ? "Out of Stock" : "Display Issues"}</div>
          <div className={styles.hint}>
            Top-down view of the table. Tap the side you&apos;re walking. A finished side shows a <b>green outline + ✓</b>.
          </div>
          <div className={styles.tableMap}>
            <div className={`${styles.sec} ${styles.totem} ${done.totem ? styles.done : ""}`} onClick={openTotem}>
              {done.totem && <div className={styles.check}>✓</div>}
              <div className={styles.lbl}>Lens Totem</div>
            </div>
            <div className={styles.faces}>
              <div className={`${styles.face} ${done.right ? styles.done : ""}`} onClick={() => openSide("right")}>
                {done.right && <div className={styles.check}>✓</div>}
                <span className={styles.faceLbl}>Right</span>
              </div>
              <div className={styles.ridge} />
              <div className={`${styles.face} ${done.left ? styles.done : ""}`} onClick={() => openSide("left")}>
                {done.left && <div className={styles.check}>✓</div>}
                <span className={styles.faceLbl}>Left</span>
              </div>
            </div>
            <div className={`${styles.sec} ${styles.center} ${done.center ? styles.done : ""}`} onClick={() => openSide("center")}>
              {done.center && <div className={styles.check}>✓</div>}
              <div className={styles.lbl}>Center</div>
            </div>
          </div>

          <div className={styles.foot}>
            <div className={styles.bar}>
              <div className={styles.count}><b>{count}</b> {mode === "stock" ? "out of stock" : "with issues"}</div>
              <button className={styles.sendBtn} onClick={generate}>Generate report</button>
            </div>
            {report && (
              <div className={styles.output}>
                <p className={styles.outputText} style={{ whiteSpace: "pre-line" }}>{report}</p>
                <button className={styles.sendBtn} onClick={copyReport}>{copied ? "✓ Copied" : "Copy"}</button>
              </div>
            )}
          </div>

          {/* Destructive — parked at the very bottom, behind a confirm. */}
          {hasLayoutOverride(store.number) && (
            <div className={styles.restoreRow}>
              <button className={styles.restoreBtn} onClick={restoreDefault}>
                Restore default planogram
              </button>
            </div>
          )}
        </>
      )}

      {view === "side" && layout && (
        <>
          <div className={styles.zhead}>
            <button className={styles.back} onClick={back}>‹</button>
            <div className={styles.zttl}>{layout.faces[side].title}<small>viewed from the end cap</small></div>
            <button className={`${styles.editBtn} ${editMode ? styles.editOn : ""}`} onClick={() => setEditMode((v) => !v)}>
              {editMode ? "✓ Editing" : "✎ Edit"}
            </button>
            <button className={`${styles.complete} ${done[side] ? styles.completeDone : ""}`} onClick={() => toggleComplete(side)}>
              {done[side] ? "✓ Done" : "Done"}
            </button>
          </div>
          {editMode && <div className={styles.editBanner}>Edit mode — tap any square to change or remove it, or use the green + to add.</div>}
          <div className={styles.scrollNote}>← scroll to walk the side →</div>
          <div className={styles.strip}>
            {layout.faces[side].slots.map((slot, slotIdx) => {
              const issueKey = `${layout.faces[side].id}:${slotIdx}`;
              const flags = issues[issueKey];
              const hasCamera = slot.items.some((i) => i.category === "camera");
              return (
                <div className={styles.col} key={slotIdx}>
                  <div className={styles.pos}>{slotIdx + 1}</div>
                  <div className={styles.stack}>
                    {slot.items.map((it, itemIdx) => {
                      const key = `${layout.faces[side].id}:${slotIdx}:${itemIdx}`;
                      const dim = mode === "issues" && !editMode;
                      return (
                        <div
                          key={itemIdx}
                          className={`${styles.sq} ${stock[key] ? styles.sqOut : ""} ${editMode ? styles.editable : ""} ${dim ? styles.dimmed : ""}`}
                          onClick={() => {
                            if (editMode) openEdit(secRef, slotIdx, itemIdx);
                            else if (mode === "stock") toggleStock(key);
                          }}
                        >
                          <span className={styles.sqName}>{it.label}</span>
                        </div>
                      );
                    })}
                    {editMode && <button className={styles.addSq} onClick={() => openAdd(secRef, slotIdx)}>+</button>}
                  </div>
                  {mode === "issues" && !editMode && hasCamera && (
                    <div className={styles.flags}>
                      {ISSUE_FLAGS.map((f) => (
                        <div key={f.key} className={`${styles.chip} ${flags?.[f.key] ? styles.chipOn : ""}`}
                          onClick={() => toggleFlag(issueKey, f.key)}>{f.label}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === "totem" && layout && (
        <>
          <div className={styles.zhead}>
            <button className={styles.back} onClick={back}>‹</button>
            <div className={styles.zttl}>Lens Totem<small>Row 1 top → Row 3 bottom</small></div>
            <button className={`${styles.editBtn} ${editMode ? styles.editOn : ""}`} onClick={() => setEditMode((v) => !v)}>
              {editMode ? "✓ Editing" : "✎ Edit"}
            </button>
            <button className={`${styles.complete} ${done.totem ? styles.completeDone : ""}`} onClick={() => toggleComplete("totem")}>
              {done.totem ? "✓ Done" : "Done"}
            </button>
          </div>
          {editMode && <div className={styles.editBanner}>Edit mode — tap a lens to change or remove it, or use the green + to add.</div>}
          <div className={styles.totemRows}>
            {layout.totem.map((row, ri) => (
              <div className={styles.trow} key={row.id}>
                <h4>Row {ri + 1}</h4>
                <div className={styles.lane}>
                  {row.slots.map((slot, slotIdx) =>
                    slot.items.map((it, itemIdx) => {
                      // Graphics-only shelf labels are hidden unless you're editing.
                      if (!it.model && !editMode) return null;
                      const key = `${row.id}:${slotIdx}:${itemIdx}`;
                      const dim = mode === "issues" && !editMode;
                      return (
                        <div
                          key={key}
                          className={`${styles.lens} ${stock[key] ? styles.lensOut : ""} ${editMode ? styles.editable : ""} ${dim ? styles.dimmed : ""}`}
                          onClick={() => {
                            if (editMode) openEdit({ type: "totem", row: ri }, slotIdx, itemIdx);
                            else if (mode === "stock") toggleStock(key);
                          }}
                        >
                          <span className={styles.lensLabel}>{it.label.replace(/^(FE |E )/, "")}</span>
                        </div>
                      );
                    })
                  )}
                  {editMode && (
                    <button className={styles.addSq} style={{ minWidth: 48 }}
                      onClick={() => openAdd({ type: "totem", row: ri }, -1)}>+</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Editor sheet — kept mounted so the search field can be focused inside
          the tap gesture, which is what makes iOS raise the keyboard. */}
      {layout && (
        <div
          className={`${styles.sheetBg} ${editor ? "" : styles.sheetHidden}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeEditor(); }}
        >
          <div className={styles.sheet}>
            <div className={styles.sheetH}>
              <span>
                {editor?.kind === "edit"
                  ? `Edit ${editor.cat ? CATEGORY_LABELS[editor.cat].toLowerCase() : "item"}`
                  : editor?.slotIdx === -1 ? "Add a lens to this row"
                  : editor ? `Add to position ${editor.slotIdx + 1}` : ""}
              </span>
              <button className={styles.sheetX} onClick={closeEditor}>✕</button>
            </div>

            {editor?.kind === "edit" && editor.itemIdx != null && (
              <div className={styles.cur}>
                Currently: <b>{sectionOf(layout, editor.sec).slots[editor.slotIdx].items[editor.itemIdx]?.label}</b>
              </div>
            )}

            <input
              ref={searchRef}
              className={styles.search}
              placeholder="Search — e.g. 55-210, A7 IV, mic"
              value={editorSearch}
              onChange={(e) => setEditorSearch(e.target.value)}
              autoComplete="off"
              enterKeyHint="search"
              tabIndex={editor ? 0 : -1}
            />

            {newItem ? (
              <div className={styles.newItem}>
                <input
                  className={styles.search}
                  placeholder="Name (e.g. A7 VI Body)"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  autoComplete="off"
                />
                <div className={styles.catChips}>
                  {CATEGORIES.map((c) => (
                    <div
                      key={c}
                      className={`${styles.catChip} ${newItem.cat === c ? styles.catChipOn : ""}`}
                      onClick={() => setNewItem({ ...newItem, cat: c })}
                    >
                      {CATEGORY_LABELS[c]}
                    </div>
                  ))}
                </div>
                <div className={styles.sheetActions}>
                  <button className={styles.ghostBtn} onClick={() => setNewItem(null)}>Cancel</button>
                  <button
                    className={styles.primaryBtn}
                    disabled={!newItem.name.trim() || !newItem.cat}
                    onClick={saveNewItem}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.catList}>
                  {results.length === 0 ? (
                    <div className={styles.catRow} style={{ opacity: 0.55 }}>No match — use Add New below</div>
                  ) : (
                    results.map((r) => (
                      <div
                        key={`${r.category}|${r.label}`}
                        className={styles.catRow}
                        onClick={() => assignItem(r.label, r.model, r.category)}
                      >
                        <span>{r.label}</span>
                        {r.model && <small>{r.model}</small>}
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.sheetActions}>
                  {canRemove() && <button className={styles.removeBtn} onClick={removeItem}>Remove this square</button>}
                  <button className={styles.addNew} onClick={startNewItem}>＋ Add New</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
