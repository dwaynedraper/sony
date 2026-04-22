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
  salesPitch: string;
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
    verdict: "The G7X III is a 'vibe' camera for influencers who stay in Auto mode. The RX100 VII is a professional tool that fits in a pocket. For anyone who cares about their photos actually being in focus or wants to shoot from a distance, the Sony is the only choice.",
    salesPitch: "The Sony RX100 VII is the clear choice over the G7X III. While the Canon has some social media hype, it can't compete with Sony's AI-based Real-time Tracking, 20fps blackout-free speed, twice the zoom range (200mm vs 100mm), and professional 960fps slow motion. It's a professional tool vs a social media trend."
  },
  {
    slug: "a7v-vs-r6iii",
    title: "A7 V vs. R6 III",
    sonyModel: "A7 V",
    competitorModel: "R6 III",
    competitorBrand: "Canon",
    sonyHighlight: "The AI-driven hybrid that never misses.",
    hypeExplanation: "The Canon R6 III makes a lot of noise about 'Open Gate' and '7K RAW'. These are great for high-end post-production, but for the daily hybrid shooter, they add massive file sizes and workflow friction. The A7 V focuses on what actually matters: a partially-stacked sensor for zero rolling shutter and an AI chip that makes autofocus feel like cheating.",
    specs: [
      {
        label: "Sensor Architecture",
        sonyValue: "33MP Partially Stacked (Ultra-fast readout)",
        competitorValue: "32.5MP Standard CMOS (Slower readout)",
        winner: "sony",
        description: "Sony's sensor tech virtually eliminates rolling shutter 'jello' in video and electronic bursts."
      },
      {
        label: "Autofocus Intelligence",
        sonyValue: "Dedicated AI Processing Unit (Predictive Pose Estimation for Human, Animal, Bird, Insect, Car, Train, Plane)",
        competitorValue: "Dual Pixel CMOS AF II with Deep-Learning (Human, Animal, Bird, Vehicle)",
        winner: "sony",
        description: "While both use advanced AI deep-learning for tracking, Sony utilizes a physical, dedicated AI Processing Unit that enables predictive 'Human Pose Estimation' to maintain sticky focus even during erratic motion or when faces are obscured."
      },
      {
        label: "Open Gate Recording",
        sonyValue: "No (16:9 4K oversampled from 7K)",
        competitorValue: "Yes (Full sensor 3:2 readout)",
        winner: "question",
        description: "Canon wins for niche social media cropping, but Sony's oversampled 4K delivers higher bit-rate per pixel for professional output."
      },
      {
        label: "Customization Level",
        sonyValue: "Insane (12+ Custom Buttons, Still/Movie/S&Q Dial, Independent Fn Menus)",
        competitorValue: "Standard (Limited button remapping)",
        winner: "sony",
        description: "You can make the Sony feel like a completely different camera in seconds. It adapts to YOU."
      },
      {
        label: "Lens Ecosystem",
        sonyValue: "Open E-Mount (Sony, Sigma, Tamron, Zeiss, etc.)",
        competitorValue: "Closed RF Mount (Mostly Canon only)",
        winner: "sony",
        description: "Sony users have 3x more lens options at every price point. Canon users are locked into expensive glass."
      },
      {
        label: "Action Burst",
        sonyValue: "30 fps Blackout-Free",
        competitorValue: "40 fps (Significant rolling shutter risk)",
        winner: "sony",
        description: "Canon is 'faster' on paper, but Sony's blackout-free view means you actually see the subject while shooting."
      }
    ],
    verdict: "Canon wins the 'spec sheet' war on video resolution, but Sony wins the 'real world' war on usability. With the AI chip and the partially stacked sensor, the A7 V is a more reliable tool for professionals who can't afford to miss a shot.",
    salesPitch: "The Sony A7 V outclasses the R6 III where it counts. Sony's partially stacked sensor eliminates rolling shutter, the dedicated AI chip makes focus 'magnetic', and the level of customization allows you to work faster. Plus, the E-mount ecosystem gives you 3x more lens choices at better prices."
  },
  {
    slug: "fx30-vs-nikon-zr",
    title: "FX30 vs. Nikon ZR",
    sonyModel: "FX30",
    competitorModel: "ZR",
    competitorBrand: "Nikon",
    sonyHighlight: "The industry-standard Super 35 workhorse.",
    hypeExplanation: "The Nikon ZR is the first major fruit of the Nikon + RED acquisition. It's generating massive hype for including the R3D NE codec and 'RED Color Science' in a mirrorless body. However, Nikon prioritized the 'RED' label over practical cinema needs like active cooling and tally systems, which are standard on the FX30.",
    specs: [
      {
        label: "Thermal Management",
        sonyValue: "Internal Active Cooling Fan (Record all day)",
        competitorValue: "Passive Cooling (Prone to overheating in 6K/4K 120p)",
        winner: "sony",
        description: "Sony is a true cinema camera designed for long-form content. Nikon will leave you waiting for it to cool down."
      },
      {
        label: "Lens Ecosystem",
        sonyValue: "60+ Native Cinema Lenses (E-Mount)",
        competitorValue: "Limited Native Video Glass (Z-Mount)",
        winner: "sony",
        description: "Sony has been building the E-mount cinema library for a decade. Nikon is just getting started with RED integration."
      },
      {
        label: "Sensor Standard",
        sonyValue: "Super 35 (Cinema Industry Standard)",
        competitorValue: "Full Frame",
        winner: "question",
        description: "While Nikon offers a larger sensor, Super 35 (APS-C) is the global standard for cinema, allowing for smaller, lighter lenses and better focus control."
      },
      {
        label: "Mounting & Rigging",
        sonyValue: "Built-in 1/4-20 Accessory Holes (No cage needed)",
        competitorValue: "Standard Smooth Body (Requires external cage)",
        winner: "sony",
        description: "Sony's 'Cage-Free' design allows you to bolt accessories directly to the camera body."
      },
      {
        label: "Recording Indicators",
        sonyValue: "Multiple Tally Lights + Rec Frame on Screen",
        competitorValue: "Standard Record Dot",
        winner: "sony",
        description: "You'll never wonder if you're recording with Sony. The front, back, and top lights ensure everyone knows the camera is rolling."
      },
      {
        label: "Audio Integration",
        sonyValue: "XLR Handle Unit with 4-Channel Recording",
        competitorValue: "Internal 32-bit (Requires external adapters for XLR)",
        winner: "sony",
        description: "Sony provides an integrated pro audio solution out of the box. Nikon requires more 'bits and pieces' to get pro sound."
      },
      {
        label: "Handheld Ergonomics",
        sonyValue: "Deep, Secure Cinema Grip",
        competitorValue: "Flat Body (Completely lacks a grip)",
        winner: "sony",
        description: "The FX30 is designed to be held. The Nikon ZR is a flat box that is a nightmare to hold without a cage or heavy rigging."
      }
    ],
    verdict: "The Nikon ZR is a shiny new toy with a RED badge, but the FX30 is a professional tool. For a filmmaker who needs a camera that works every single time, doesn't overheat, and rigs up in seconds, Sony is the only logical choice.",
    salesPitch: "Don't get distracted by the RED logo on the Nikon ZR. The Sony FX30 is a battle-tested cinema camera with active cooling, built-in rigging points, and a professional grip. The Nikon ZR is a flat box that's a nightmare to hold without an expensive cage. Reliability and ergonomics beat a brand name every time."
  }
];
