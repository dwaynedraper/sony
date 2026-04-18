/**
 * Cameras grouped by display section, in physical store walk order.
 * Used by the Display Issues tool.
 * Excludes lenses, accessories, display boxes, and order-only models (FX2, FX3A).
 */

export interface CameraSection {
  id: string;
  title: string;
  cameras: string[];
}

export const cameraSections: CameraSection[] = [
  {
    id: "left",
    title: "Left Wall",
    cameras: [
      "ZV-1F",
      "ZV-1",
      "ZV-1 II",
      "ZV-E10",
      "ZV-E10 II",
      "FX30",
      "A7S III",
    ],
  },
  {
    id: "center",
    title: "Center Island",
    cameras: ["A7R V", "A7 V"],
  },
  {
    id: "right",
    title: "Right Wall",
    cameras: [
      "A7C II",
      "A7 III",
      "A7 IV",
      "A6700",
      "A6400",
      "A6100",
      "RX100 VII",
    ],
  },
];

/** Flat list of all camera names (walk order) for iteration */
export const cameraList: string[] = cameraSections.flatMap((s) => s.cameras);
