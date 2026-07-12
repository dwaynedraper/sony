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
  /**
   * Stable identity. Out-of-stock marks key off THIS, never the array index —
   * otherwise reordering a row (or adding/removing an item) would silently
   * re-attach a mark to a different product.
   */
  id: string;
  category: ItemCategory;
  /** Everyday label shown on the square, e.g. "ZV-E10 II" or "w/16-50" */
  label: string;
  /** Sony model number, e.g. "ILCE-7M4/B". Empty for display/tablet. */
  model: string;
  /** Best Buy SKU, e.g. "6512345". Empty unless someone has filled it in. */
  sku: string;
}

export interface TableSlot {
  /** Stable identity — display issues key off this, not the slot's position. */
  id: string;
  items: TableItem[];
}

/** ID for an item/slot created at runtime in Edit Mode. */
export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `x${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
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

/**
 * Slots always stack in this order, top to bottom:
 *   camera body -> camera + lens kit -> lens -> accessory
 * Applied silently on load and after every edit — there is no manual sorting.
 * Display boxes and the demo tablet sit at the top, since they own their slot.
 */
export const CATEGORY_RANK: Record<ItemCategory, number> = {
  camera: 0,
  display: 0,
  tablet: 0,
  kit: 1,
  lens: 2,
  accessory: 3,
};

export const CATEGORY_ORDER: ItemCategory[] = [
  "camera",
  "lens",
  "kit",
  "accessory",
  "display",
  "tablet",
];

/**
 * Classify a display-slot option into an item category.
 *
 * Order matters. "FX30 w/Handle" is a camera KIT (body bundled with the XLR
 * handle), not an accessory — so we key off the model prefix for real
 * accessories (ECM mics) and let anything bundled ("w/", "kit", "dual") fall
 * through to kit.
 */
function classify(label: string, model: string): ItemCategory {
  if (model.startsWith("SEL")) return "lens";
  if (model.startsWith("ECM")) return "accessory";
  if (/w\/|kit|dual/i.test(label)) return "kit";
  return "camera";
}

/** Sort a slot's items in place: body -> kit -> lens -> accessory. */
export function sortItems(slot: TableSlot): TableSlot {
  slot.items.sort((a, b) => CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category]);
  return slot;
}

/**
 * Re-apply the sort rule across a whole layout, and backfill any missing IDs.
 *
 * Runs on every load, so a layout saved under an older rule still comes out in
 * the right order — and a layout saved before IDs existed gets them. The
 * backfill is DETERMINISTIC (position-derived) rather than random, so an
 * un-saved legacy layout produces the same IDs on every load and its
 * out-of-stock marks stay attached to the right products.
 */
export function normalizeLayout(layout: TableLayout): TableLayout {
  const sections = [layout.faces.left, layout.faces.center, layout.faces.right, ...layout.totem];
  for (const section of sections) {
    section.slots.forEach((slot, si) => {
      if (!slot.id) slot.id = `${section.id}#${si}`;
      slot.items.forEach((item, ii) => {
        if (!item.id) item.id = `${section.id}#${si}#${ii}`;
        if (item.sku == null) item.sku = ""; // backfill layouts saved before SKUs existed
      });
      sortItems(slot);
    });
  }
  return layout;
}

/** Convert a raw display-slot into a TableSlot of items. */
function slotToItems(
  sectionId: string,
  slotIdx: number,
  name: string,
  options: { label: string; model: string }[]
): TableSlot {
  const slotId = `${sectionId}#${slotIdx}`;
  if (options.length === 0) {
    // Display-only physical slot: a display box or the demo tablet.
    const category: ItemCategory = /tablet/i.test(name) ? "tablet" : "display";
    return { id: slotId, items: [{ id: `${slotId}#0`, category, label: name, model: "", sku: "" }] };
  }
  const items: TableItem[] = options.map((o, ii) => ({
    id: `${slotId}#${ii}`,
    category: classify(o.label, o.model),
    label: o.label,
    model: o.model,
    sku: "",
  }));
  return sortItems({ id: slotId, items });
}

function sectionToTable(
  id: string,
  title: string,
  slots: { name: string; options: { label: string; model: string }[] }[]
): TableSection {
  return { id, title, slots: slots.map((s, i) => slotToItems(id, i, s.name, s.options)) };
}

/** Build a fresh default layout from the canonical display-slots data. */
export function buildDefaultLayout(): TableLayout {
  const bySide = Object.fromEntries(cameraDisplay.map((s) => [s.id, s]));
  const face = (id: string, title: string) =>
    sectionToTable(id, title, (bySide[id]?.slots ?? []));

  // The totem is lenses only. The shelf category cards (Macro, Prime, Telephoto…)
  // are printed graphics, not stock — they aren't tracked and aren't shown.
  const totem: TableSection[] = lensTotem.map((row) => ({
    id: row.id,
    title: row.title,
    slots: row.slots.map((s, si) =>
      sortItems({
        id: `${row.id}#${si}`,
        items: s.options.map((o, ii) => ({
          id: `${row.id}#${si}#${ii}`,
          category: classify(o.label, o.model),
          label: o.label,
          model: o.model,
          sku: "",
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

/**
 * Every live item ID and slot ID in a layout.
 *
 * Used to prune orphaned marks. If a stock key doesn't match a real item —
 * because the product was swapped out, or because it predates the switch to
 * stable IDs — it's meaningless and must not be counted or stored.
 */
export function collectIds(layout: TableLayout): { itemIds: Set<string>; slotIds: Set<string> } {
  const itemIds = new Set<string>();
  const slotIds = new Set<string>();
  for (const sec of [layout.faces.left, layout.faces.center, layout.faces.right, ...layout.totem]) {
    for (const slot of sec.slots) {
      slotIds.add(slot.id);
      for (const it of slot.items) itemIds.add(it.id);
    }
  }
  return { itemIds, slotIds };
}

/** A lens name broken into the only parts worth showing on a shelf tile. */
export interface LensName {
  focal: string; // "70-200mm" | "90mm" | ""  ("" = didn't parse)
  aperture: string; // "f/2.8" | "f/4.5-6.3" | ""
  variant: string; // "GM II" | "G" | "Macro G" | ""
}

/**
 * "FE 70-200mm f/2.8 GM II"  ->  70-200mm · f/2.8 · GM II
 * "E 55-210mm f/4.5-6.3 OSS" ->  55-210mm · f/4.5-6.3
 *
 * The variant (GM, GM II, Macro…) is kept because it's the ONLY thing telling
 * the 70-200 GM apart from the 70-200 GM II — same focal, same aperture, two
 * different products on the shelf. The UI shows it only when it's needed to
 * break a tie. OSS is stabilisation, not an identity, so it's dropped.
 *
 * Anything that isn't a lens (a custom item, a body) returns empty focal so the
 * caller can fall back to the raw label rather than rendering a blank tile.
 */
export function parseLensName(label: string): LensName {
  const focalM = label.match(/(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*mm/i);
  const apM = label.match(/f\/\s*(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)/i);

  const focal = focalM ? `${focalM[1].replace(/\s+/g, "")}mm` : "";
  const aperture = apM ? `f/${apM[1].replace(/\s+/g, "")}` : "";

  let variant = "";
  if (apM && apM.index != null) {
    variant = label
      .slice(apM.index + apM[0].length)
      .replace(/\bOSS\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  return { focal, aperture, variant };
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  camera: "Camera",
  lens: "Lens",
  kit: "Kit",
  accessory: "Accessory",
  display: "Display",
  tablet: "Tablet",
};
