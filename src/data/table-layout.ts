/**
 * Table layout model for the visual survey UI (OOS + Display Issues).
 *
 * The physical Sony table has four sections a rep walks:
 *   - left / center / right : the three camera faces (viewed from the end cap)
 *   - totem                 : the lens totem case (3 rows)
 *
 * Each slot on a face holds one or more ITEMS, sorted for display:
 *   camera (top) -> lens / kit (middle) -> accessory (bottom).
 * Display boxes and the demo tablet are items too, so they can be moved/inserted.
 *
 * The default layout is derived from `display-slots.ts` (the source of truth for
 * model numbers). A store can override its own layout in Edit Mode; overrides are
 * saved per store number and never affect another store.
 */

import { cameraDisplay, lensTotem } from "./display-slots";

export type ItemCategory =
  | "camera"
  | "lens"
  | "kit"
  | "accessory"
  | "display"
  | "tablet";

export interface TableItem {
  category: ItemCategory;
  /** Everyday label shown on the square, e.g. "ZV-E10 II" or "w/16-50" */
  label: string;
  /** Sony model number for the OOS report. Empty for display/tablet. */
  model: string;
}

export interface TableSlot {
  items: TableItem[];
}

export interface TableSection {
  id: string;
  title: string;
  slots: TableSlot[];
}

export interface TableLayout {
  /** The three camera faces, keyed by side. */
  faces: { left: TableSection; center: TableSection; right: TableSection };
  /** The lens totem rows (top to bottom). */
  totem: TableSection[];
}

/** Sort rank so items stack camera -> lens/kit -> accessory. */
export const CATEGORY_RANK: Record<ItemCategory, number> = {
  camera: 0,
  display: 0,
  tablet: 0,
  lens: 1,
  kit: 1,
  accessory: 2,
};

export const CATEGORY_ORDER: ItemCategory[] = [
  "camera",
  "lens",
  "kit",
  "accessory",
  "display",
  "tablet",
];

/** Classify a display-slot option into an item category. */
function classify(label: string, model: string): ItemCategory {
  if (model.startsWith("SEL")) return "lens";
  if (model.startsWith("ECM") || /handle/i.test(label)) return "accessory";
  if (/w\/|kit|dual/i.test(label)) return "kit";
  return "camera";
}

/** Sort a slot's items in place into camera -> lens/kit -> accessory order. */
export function sortItems(slot: TableSlot): TableSlot {
  slot.items.sort((a, b) => CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category]);
  return slot;
}

/** Convert a raw display-slot into a TableSlot of items. */
function slotToItems(name: string, options: { label: string; model: string }[]): TableSlot {
  if (options.length === 0) {
    // Display-only physical slot: a display box or the demo tablet.
    const category: ItemCategory = /tablet/i.test(name) ? "tablet" : "display";
    return { items: [{ category, label: name, model: "" }] };
  }
  const items: TableItem[] = options.map((o) => ({
    category: classify(o.label, o.model),
    label: o.label,
    model: o.model,
  }));
  return sortItems({ items });
}

function sectionToTable(id: string, title: string, slots: { name: string; options: { label: string; model: string }[] }[]): TableSection {
  return { id, title, slots: slots.map((s) => slotToItems(s.name, s.options)) };
}

/** Build a fresh default layout from the canonical display-slots data. */
export function buildDefaultLayout(): TableLayout {
  const bySide = Object.fromEntries(cameraDisplay.map((s) => [s.id, s]));
  const face = (id: string, title: string) =>
    sectionToTable(id, title, (bySide[id]?.slots ?? []));

  // The lens totem keeps its own "graphics label only" slots (Macro, Prime, …)
  // as items so the rows still read correctly; they carry no model.
  const totem: TableSection[] = lensTotem.map((row) => ({
    id: row.id,
    title: row.title,
    slots: row.slots.map((s) =>
      s.options.length === 0
        ? { items: [{ category: "display" as ItemCategory, label: s.name, model: "" }] }
        : sortItems({
            items: s.options.map((o) => ({
              category: classify(o.label, o.model),
              label: o.label,
              model: o.model,
            })),
          })
    ),
  }));

  return {
    faces: {
      left: face("left", cameraDisplay.find((s) => s.id === "left")?.title ?? "Left"),
      center: face("center", cameraDisplay.find((s) => s.id === "center")?.title ?? "Center"),
      right: face("right", cameraDisplay.find((s) => s.id === "right")?.title ?? "Right"),
    },
    totem,
  };
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  camera: "Camera",
  lens: "Lens",
  kit: "Kit",
  accessory: "Accessory",
  display: "Display",
  tablet: "Tablet",
};
