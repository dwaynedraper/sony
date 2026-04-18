export interface SlotOption {
  /** Display label, e.g. "ZV-E10 II w/16-50" */
  label: string;
  /** Sony model number, e.g. "ZVE10M2K/B" */
  model: string;
}

export interface DisplaySlot {
  /** Everyday name shown on the slot card, e.g. "ZV-E10 II" */
  name: string;
  /** Checkable options for this slot. Empty = display-only (no modal). */
  options: SlotOption[];
}

export interface DisplaySection {
  id: string;
  title: string;
  slots: DisplaySlot[];
}

// ─── Camera Display ─────────────────────────────────────────────────────────

export const cameraDisplay: DisplaySection[] = [
  {
    id: "left",
    title: "Left Wall",
    slots: [
      {
        name: "ZV-1F",
        options: [{ label: "ZV-1F", model: "ZV1F/B" }],
      },
      {
        name: "ZV-1",
        options: [{ label: "ZV-1", model: "DCZV1/B" }],
      },
      {
        name: "ZV-1 II",
        options: [{ label: "ZV-1 II", model: "ZV1M2/B" }],
      },
      {
        name: "ZV-E10",
        options: [
          { label: "ZV-E10", model: "ZVE10/B" },
          { label: "ZV-E10 w/16-50", model: "ZVE10L/B" },
        ],
      },
      {
        name: "ZV-E10 II",
        options: [
          { label: "ZV-E10 II", model: "ZVE10M2/B" },
          { label: "ZV-E10 II w/16-50", model: "ZVE10M2K/B" },
          { label: "E 11mm f/1.8", model: "SEL11F18" },
        ],
      },
      {
        name: "FX Series",
        options: [
          { label: "FX2", model: "ILME-FX2B" },
          { label: "FX3A", model: "ILME-FX3A" },
        ],
      },
      {
        name: "FX30",
        options: [
          { label: "FX30 w/Handle", model: "ILME-FX30" },
          { label: "FX30 Body", model: "ILME-FX30B" },
          { label: "E PZ 18-105 f/4 G", model: "SELP18105G" },
        ],
      },
      {
        name: "A7S III",
        options: [
          { label: "ECM-B10", model: "ECM-B10" },
          { label: "A7S III", model: "ILCE-7SM3" },
          { label: "FE 35mm f/1.4 GM", model: "SEL35F14GM" },
        ],
      },
    ],
  },
  {
    id: "center",
    title: "Center Island",
    slots: [
      {
        name: "A7R V",
        options: [
          { label: "A7R V", model: "ILCE-7RM5" },
          { label: "FE 50mm f/1.4 GM", model: "SEL50F14GM" },
        ],
      },
      {
        name: "Display Box",
        options: [], // not checkable
      },
      {
        name: "Display Box",
        options: [], // not checkable
      },
      {
        name: "A7 V",
        options: [
          { label: "ECM-M1", model: "ECM-M1" },
          { label: "A7 V w/28-70 II", model: "ILCE-7M5K/B" },
          { label: "A7 V Body", model: "ILCE-7M5/B" },
          { label: "FE 24-70 f/2.8 GM II", model: "SEL2470GM2" },
        ],
      },
    ],
  },
  {
    id: "right",
    title: "Right Wall",
    slots: [
      {
        name: "A7C II",
        options: [
          { label: "A7C II", model: "ILCE-7CM2/B" },
          { label: "FE 24-50 f/2.8 G", model: "SEL2450G" },
        ],
      },
      {
        name: "A7 III",
        options: [
          { label: "A7 III w/28-70", model: "ILCE-7M3K/B" },
          { label: "A7 III", model: "ILCE-7M3/B" },
          { label: "FE 50mm f/1.8", model: "SEL50F18F" },
        ],
      },
      {
        name: "A7 IV",
        options: [
          { label: "A7 IV w/28-70", model: "ILCE-7M4K/B" },
          { label: "A7 IV Body", model: "ILCE-7M4/B" },
          { label: "FE 24-105 f/4 G", model: "SEL24105G" },
        ],
      },
      {
        name: "Demo Tablet",
        options: [], // not clickable
      },
      {
        name: "A6700",
        options: [
          { label: "A6700", model: "ILCE-6700/B" },
          { label: "A6700 w/18-135", model: "ILCE-6700M/B" },
          { label: "E 16-55 f/2.8 G", model: "SEL1655G" },
        ],
      },
      {
        name: "A6400",
        options: [
          { label: "A6400", model: "ILCE-6400/B" },
          { label: "A6400 w/16-50", model: "ILCE-6400L/B" },
          { label: "A6400 w/18-135", model: "ILCE-6400M/B" },
        ],
      },
      {
        name: "A6100",
        options: [
          { label: "A6100", model: "ILCE-6100/B" },
          { label: "A6100 w/16-50", model: "ILCE-6100L/B" },
          { label: "A6100 Dual Lens Kit", model: "ILCE-6100Y/B" },
          { label: "E 35mm f/1.8", model: "SEL35F18" },
        ],
      },
      {
        name: "RX100 VII",
        options: [{ label: "RX100 VII", model: "DSC-RX100M7" }],
      },
    ],
  },
];

// ─── Lens Totem Case ────────────────────────────────────────────────────────

export const lensTotem: DisplaySection[] = [
  {
    id: "lens-row-1",
    title: "Lens Totem — Row 1",
    slots: [
      {
        name: "Macro",
        options: [], // graphics label only
      },
      {
        name: "90mm f/2.8 G",
        options: [{ label: "FE 90mm f/2.8 Macro G", model: "SEL90M28G" }],
      },
      {
        name: "Non-FF Prime",
        options: [], // graphics label only
      },
      {
        name: "PZ 10-20",
        options: [{ label: "E PZ 10-20mm f/4 G", model: "SELP1020G" }],
      },
      {
        name: "Non-FF Ultra-Wide",
        options: [], // graphics label only
      },
      {
        name: "E 50mm f/1.8",
        options: [{ label: "E 50mm f/1.8 OSS", model: "SEL50F18/B" }],
      },
      {
        name: "Non-FF Telephoto",
        options: [], // graphics label only
      },
      {
        name: "E 55-210",
        options: [{ label: "E 55-210mm f/4.5-6.3 OSS", model: "SEL55210" }],
      },
      {
        name: "E 70-350",
        options: [{ label: "E 70-350mm f/4.5-6.3 G", model: "SEL70350G" }],
      },
    ],
  },
  {
    id: "lens-row-2",
    title: "Lens Totem — Row 2",
    slots: [
      {
        name: "Prime",
        options: [], // graphics label only
      },
      {
        name: "16mm f/1.8 G",
        options: [{ label: "FE 16mm f/1.8 G", model: "SEL16F18G" }],
      },
      {
        name: "20mm f/1.8 G",
        options: [{ label: "FE 20mm f/1.8 G", model: "SEL20F18G" }],
      },
      {
        name: "24mm f/2.8 G",
        options: [{ label: "FE 24mm f/2.8 G", model: "SEL24F28G" }],
      },
      {
        name: "35mm f/1.8",
        options: [{ label: "FE 35mm f/1.8", model: "SEL35F18F" }],
      },
      {
        name: "85mm f/1.8",
        options: [{ label: "FE 85mm f/1.8", model: "SEL85F18" }],
      },
      {
        name: "85mm f/1.4 GM II",
        options: [{ label: "FE 85mm f/1.4 GM II", model: "SEL85F14GM2" }],
      },
    ],
  },
  {
    id: "lens-row-3",
    title: "Lens Totem — Row 3",
    slots: [
      {
        name: "Ultra-Wide",
        options: [], // graphics label only
      },
      {
        name: "PZ 16-35 f/4",
        options: [{ label: "FE PZ 16-35mm f/4 G", model: "SELP1635G" }],
      },
      {
        name: "16-25mm G",
        options: [{ label: "FE 16-25mm f/2.8 G", model: "SEL1625G" }],
      },
      {
        name: "16-35 GM II",
        options: [{ label: "FE 16-35mm f/2.8 GM II", model: "SEL1635GM2" }],
      },
      {
        name: "Standard Zoom",
        options: [], // graphics label only
      },
      {
        name: "24-70 GM",
        options: [{ label: "FE 24-70mm f/2.8 GM", model: "SEL2470GM" }],
      },
      {
        name: "Telephoto",
        options: [], // graphics label only
      },
      {
        name: "70-200 GM",
        options: [{ label: "FE 70-200mm f/2.8 GM", model: "SEL70200GM" }],
      },
      {
        name: "70-200 GM II",
        options: [{ label: "FE 70-200mm f/2.8 GM II", model: "SEL70200GM2" }],
      },
      {
        name: "70-300 G",
        options: [{ label: "FE 70-300mm f/4.5-5.6 G", model: "SEL70300G" }],
      },
    ],
  },
];
