# Project Sitemap & File Structure

This document outlines the purpose of every major file and directory to help AI assistants orient themselves immediately.

```text
/Users/deandraper/projects/sony/
├── src/
│   ├── app/
│   │   ├── globals.scss                  # Application-wide global CSS and design tokens
│   │   ├── layout.tsx                    # Next.js Root Layout (Navbar inclusion)
│   │   ├── page.tsx                      # Home Dashboard (links to individual tools)
│   │   │
│   │   ├── api/
│   │   │   └── generate-rationale/
│   │   │       └── route.ts              # Next.js Edge route. Calls OpenAI SDK for Camera Finder pitches.
│   │   │
│   │   ├── camera-finder/
│   │   │   ├── camera-finder.module.scss # Scoped styles for the camera wizard and cards
│   │   │   ├── client.tsx                # Client-rendered React component for the wizard UI
│   │   │   ├── engine.ts                 # Scoring algorithm for matching intents to cameras
│   │   │   ├── page.tsx                  # Server component wrapper for the tool route
│   │   │   ├── types.ts                  # Zod definitions and TS interfaces for the engine
│   │   │   └── data/
│   │   │       └── cameras.ts            # The master database of Sony camera specs and tags
│   │   │
│   │   ├── display-issues/
│   │   │   ├── address-autocomplete.tsx  # Google/Geoapify autocomplete input component
│   │   │   ├── display-issues-client.tsx # Main orchestration wrapper for the display tool
│   │   │   ├── display-issues-form.tsx   # The grid UI for slots and clipboard generation logic
│   │   │   ├── display-issues.module.scss# Scoped styling 
│   │   │   ├── page.tsx                  # Server wrapper
│   │   │   ├── store-setup.tsx           # Initial onboarding UI for Store ID / Pad selection
│   │   │   └── store-tabs.tsx            # Navigation sub-tabs between Home, OOS, and Display tools
│   │   │
│   │   └── oos/
│   │       ├── oos-form.tsx              # Form for clicking/toggling Out Of Stock SKUs
│   │       ├── oos.module.scss           # Scoped styling
│   │       └── page.tsx                  # Server wrapper
│   │
│   ├── components/
│   │   ├── navbar.tsx                    # Global sticky navigation header
│   │   └── tool-card.tsx                 # Reusable dashboard UI card for the homepage
│   │
│   ├── data/
│   │   ├── camera-list.ts                # (Deprecating/Static) Basic array of camera strings
│   │   └── display-slots.ts              # Master definition of which SKU sits in which slot per store format
│   │
│   └── lib/
│       └── store-storage.ts              # Core persistence layer. Handles localStorage read/writes.
│
├── OVERVIEW.md                           # High level project philosophy and logic map
├── SITEMAP.md                            # This exact file mapping
├── next.config.ts                        # NextJS configuration
└── package.json                          # Node dependencies (Next.js, Zod, ai-sdk, lucide-react)
```
