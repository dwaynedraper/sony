export interface SpecItem {
  label: string;
  sonyValue: string;
  competitorValue: string;
  winner: "sony" | "competitor" | "tie" | "question";
  description?: string;
}

export interface CageFight {
  slug: string;
  title: string;
  sonyModel: string;
  competitorModel: string;
  competitorBrand: string;
  sonyHighlight: string;
  hypeExplanation: string;
  hypeSource?: string;
  specs: SpecItem[];
  verdict: string;
}

export const cageFights: CageFight[] = [
  {
    slug: "rx100vii-vs-g7xiii",
    title: "RX100 VII vs. G7X III",
    sonyModel: "RX100 VII",
    competitorModel: "G7X III",
    competitorBrand: "Canon",
    sonyHighlight: "Professional speed and tracking in your pocket.",
    hypeExplanation: "The G7X III became a viral sensation on TikTok and YouTube for its 'Y2K' flash aesthetic and skin tones. Influencers like Alix Earle popularized it as an 'It Girl' accessory. While it looks cool in a vlog, it lacks the professional internals that make a camera reliable for actual photography and fast-paced video.",
    hypeSource: "Social Media Trend (TikTok/YouTube)",
    specs: [
      {
        label: "Autofocus Tech",
        sonyValue: "AI-based Real-time Tracking & Eye AF (357 phase-detect points)",
        competitorValue: "Basic Contrast-detect AF (slower, prone to hunting)",
        winner: "sony",
        description: "Sony's AF locks on instantly and never lets go. Canon struggles with moving subjects."
      },
      {
        label: "Action Speed",
        sonyValue: "20 fps blackout-free (see every moment while shooting)",
        competitorValue: "20 fps (fixed focus) / 8 fps (with tracking)",
        winner: "sony",
        description: "Sony can shoot professional sports/action without the screen going black."
      },
      {
        label: "Zoom Power",
        sonyValue: "24-200mm (8.3x Zoom) - Wide to Far Telephoto",
        competitorValue: "24-100mm (4.2x Zoom) - Standard range only",
        winner: "sony",
        description: "Sony has twice the reach, making it far more versatile for travel."
      },
      {
        label: "Viewfinder",
        sonyValue: "Built-in Pop-up OLED EVF",
        competitorValue: "None (LCD only)",
        winner: "sony",
        description: "Try shooting on a sunny day with the Canon—you can't see the screen. Sony has a pro viewfinder."
      },
      {
        label: "Video Reliability",
        sonyValue: "Pro 4K with S-Log3 and HLG (High Dynamic Range)",
        competitorValue: "4K (Heats up quickly, limited profiles)",
        winner: "sony",
        description: "Sony is a mini-pro cinema camera. Canon is built for casual vlogging."
      },
      {
        label: "Eye Recognition",
        sonyValue: "Human & Animal (Stays on the eye even if they blink)",
        competitorValue: "Basic Human Face Detect",
        winner: "sony",
        description: "Sony's AI is years ahead, ensuring every portrait is sharp."
      },
      {
        label: "Aperture (Physics Reality)",
        sonyValue: "f/2.8 – 4.5",
        competitorValue: "f/1.8 – 2.8",
        winner: "question",
        description: "Canon looks better on paper, but on a 1\" sensor, the difference in 'blur' is negligible. For the viral flash look, aperture doesn't matter."
      },
      {
        label: "Slow Motion",
        sonyValue: "Up to 960 fps (Super Slow Motion)",
        competitorValue: "Up to 120 fps (Standard Slow)",
        winner: "sony",
        description: "Sony can slow down time 32x more than the Canon. Perfect for epic action clips."
      },
      {
        label: "Pro Video Profiles",
        sonyValue: "S-Log3, HLG (Pro color grading)",
        competitorValue: "Standard Only",
        winner: "sony",
        description: "Sony gives you the same color tools used in Hollywood movies. Canon is locked in."
      }
    ],
    verdict: "The G7X III is a 'vibe' camera for influencers who stay in Auto mode. The RX100 VII is a professional tool that fits in a pocket. For anyone who cares about their photos actually being in focus or wants to shoot from a distance, the Sony is the only choice."
  }
];
