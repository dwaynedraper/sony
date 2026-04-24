export interface BasketItem {
  label: string;
  category: "must-have" | "make-it-shine" | "dont-forget";
}

export interface GenreDefinition {
  id: string;
  title: string;
  description: string;
  items: BasketItem[];
}

export const dontForgetItems: BasketItem[] = [
  { label: "High-Speed V60/V90 SD Card", category: "dont-forget" },
  { label: "Spare Z-Series Battery", category: "dont-forget" },
];

export const basketGenres: GenreDefinition[] = [
  {
    id: "portraits",
    title: "Portraits & Headshots",
    description: "Capturing people with professional background separation and lighting.",
    items: [
      { label: "Fast Prime Lens (85mm or 50mm)", category: "must-have" },
      { label: "External Flash (Speedlight)", category: "must-have" },
      { label: "Wireless Flash Trigger", category: "make-it-shine" },
      { label: "Collapsible Reflector", category: "make-it-shine" },
      { label: "Large Softbox/Modifier", category: "make-it-shine" },
    ],
  },
  {
    id: "landscape",
    title: "Landscape & Travel",
    description: "Vast views and sharp details from corner to corner.",
    items: [
      { label: "Ultra-Wide Angle Zoom Lens", category: "must-have" },
      { label: "Sturdy Travel Tripod", category: "must-have" },
      { label: "Circular Polarizing Filter", category: "make-it-shine" },
      { label: "Neutral Density (ND) Filter Set", category: "make-it-shine" },
      { label: "Remote Shutter Release", category: "make-it-shine" },
    ],
  },
  {
    id: "sports",
    title: "Sports & Action",
    description: "Freezing fast motion from the sidelines.",
    items: [
      { label: "Telephoto Zoom Lens (e.g. 70-200mm)", category: "must-have" },
      { label: "Lightweight Monopod", category: "must-have" },
      { label: "Vertical Battery Grip", category: "make-it-shine" },
      { label: "Teleconverter (1.4x or 2.0x)", category: "make-it-shine" },
    ],
  },
  {
    id: "vlogging",
    title: "Vlogging & Content Creation",
    description: "Compact setup for high-quality video and clear audio on the go.",
    items: [
      { label: "Wide Angle Power Zoom Lens", category: "must-have" },
      { label: "Compact Shotgun Microphone", category: "must-have" },
      { label: "Bluetooth Shooting Grip / Tripod", category: "make-it-shine" },
      { label: "Portable LED Video Light", category: "make-it-shine" },
    ],
  },
  {
    id: "wildlife",
    title: "Wildlife & Birds",
    description: "Reaching distant subjects with speed and precision.",
    items: [
      { label: "Super-Telephoto Zoom Lens", category: "must-have" },
      { label: "Protective Lens Rain Cover", category: "must-have" },
      { label: "Gimbal Tripod Head", category: "make-it-shine" },
      { label: "Camouflage Lens Wrap", category: "make-it-shine" },
    ],
  },
  {
    id: "macro",
    title: "Macro & Close-up",
    description: "Revealing the tiny details in nature and products.",
    items: [
      { label: "Dedicated Macro Prime Lens", category: "must-have" },
      { label: "Focusing Rail", category: "must-have" },
      { label: "Macro Ring Light", category: "make-it-shine" },
      { label: "Small Tabletop Tripod", category: "make-it-shine" },
    ],
  },
];
