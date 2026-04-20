# Sony Retail Tools - Project Overview

## Project Architecture
This is a modern Next.js 15 (App Router) React web application, built using TypeScript, SCSS (CSS Modules + Global styling), and the Vercel AI SDK for LLM integration. 

The application is a suite of tools intended for Best Buy / Retail employees managing Sony imaging products to streamline store tasks and customer interactions.

## Core Features/Modules

### 1. Camera Finder AI (`src/app/camera-finder`)
A wizard-style intent-based recommendation engine for Sony Alpha/Cyber-shot cameras.
- **Engine (`engine.ts`)**: A local algorithmic scoring system that evaluates cameras based on user selections (Budget, Intent, Skill Level, Media Type). It supports "Stretch Picks" (highly suitable models slightly outside budget).
- **AI Rationale (`api/generate-rationale`)**: Uses OpenAI (GPT-4o/5-nano via Vercel AI SDK) with a "Sony Sales Representative" system persona to creatively explain the recommendation benefits via Structured Output (Zod).
- **Data Source (`data/cameras.ts`)**: The core truth of all camera SKUs, specs, features, and algorithmic base tags.

### 2. Display Issues Tool (`src/app/display-issues`)
A tool to track and report broken/missing display cameras and lenses on the Best Buy Sony Pad.
- Features dynamic "Store Setup" (caching Store ID, Store Type, and location via a geographic Autocomplete API).
- Uses `store-storage.ts` (localStorage wrapper) to maintain session state so the user doesn't have to re-enter store info on every visit.
- Dynamically loads different display slot configurations (e.g., 20ft vs 16ft standard pads) via `src/data/display-slots.ts`.
- Generates a cleanly formatted text report for SMS/Email sharing (clipboard auto-formatting bug on iOS fixed to avoid custom-URI protocol matching).

### 3. Out of Stock (OOS) Tool (`src/app/oos`)
A quick tool used by reps to track missing core inventory.
- Features a streamlined toggle UI for standard bodies, lenses, and accessories.
- Uses `src/lib/store-storage.ts` to seamlessly identify the user's store on report generation.

## State Management & Storage
- **Client-Side Storage**: The app relies heavily on `localStorage` abstracted through `src/lib/store-storage.ts` to persist user data (Store ID, Pad Type, Settings, and standard reporting inputs) across sessions without requiring a database/auth setup.

## Styling Philosophy
- Focuses on a premium, dark-mode-first aesthetic with rich micro-animations and "glassmorphism" effects to wow the user.
- Driven by `globals.scss` for utility classes/variables and `.module.scss` files for component-scoped encapsulation.
- Avoiding standard Tailwind unless explicitly configured, relying on custom CSS for maximum design control.

## Future Exploration Points
- Multi-device synchronization (moving from `localStorage` to a lightweight Backend/Auth like Supabase or Firebase).
- Expanding the AI agent parameters in the Camera Finder.
