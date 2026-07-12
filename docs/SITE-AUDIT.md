# Sony Rep Toolkit — Site Audit

**Date:** 2026-06-16
**Status:** Point-in-time snapshot for review. *Living docs (OVERVIEW.md / SITEMAP.md) intentionally NOT updated yet* — tools may be changed or removed first, then docs get rewritten.

---

## Context (per Dean)

- These tools are **unofficial aids**, self-written. Not an official Sony product.
- The data is **not sensitive, proprietary, or dangerous**. Open access is acceptable — Best Buy advisors or VPLs are welcome to use them.
- **Open design question:** how to persist and recover a user's data *without* requiring a login (e.g. geolocation → current store, auto-load records). So the "auth" items below are **design decisions to make deliberately**, not security vulnerabilities.

---

## What the app is

A Next.js 16 toolkit for Sony camera reps inside Best Buy. Two halves:

1. **Store-ops / survey tools** — describe the *store*: what's out of stock, what's broken on the display.
2. **Customer-selling aids** — used live with a shopper: recommend a camera, compare specs, build an accessory basket, win competitor comparisons.

It is further along than OVERVIEW.md claims: it now has email magic-link login, a MongoDB backend, and cloud sync — not just the localStorage app the docs describe.

## Stack (verified)

Next.js **16.2.4** (App Router) · React **19.2.4** · TypeScript 5 · MongoDB 7 (Atlas) · `jose` JWT sessions · Resend email · Vercel AI SDK (`ai` v6, OpenAI in use; `@ai-sdk/google` installed but unused) · Zod 4. Styling is a **mix**: Tailwind v4 utility classes (newer pages like the home dashboard) + SCSS modules (older tools) + `globals.scss`. *(Note: OVERVIEW.md claims "avoiding standard Tailwind" — no longer true.)*

---

## Routes (9 pages)

| Route | Job | State |
|---|---|---|
| `/` | Home dashboard, links every tool | Solid |
| `/camera-finder` | 7-step wizard → ranked picks + AI pitch | Solid · **18** cameras |
| `/spec-lookup` | Filter/sort cameras by hard spec | Solid · **20** cameras |
| `/basket-builder` | Accessory package by genre + AI rationale | Solid · **6** genres (+2 universal items) |
| `/cage-fight/[slug]` | Sony-vs-competitor breakdown + pitch | Solid · **3** built (rx100vii-vs-g7xiii, a7v-vs-r6iii, fx30-vs-nikon-zr) |
| `/oos` | Display walk → pasteable OOS text | Solid · 14 cameras + lenses |
| `/display-issues` | Per-store issue log, cloud-synced | Solid (currently auth-gated) |
| `/all-issues` | Manager view across all stores | Open access — see below |
| `/login` | Email magic-link sign-in | Works (not linked; reached by redirect) |

Plus **9 API routes**: `generate-rationale`, `generate-basket-rationale`, `oos`, `import`, `stores`, `stores/[id]`, `stores/[id]/issues`, `admin/all-issues`, `admin/store-details`.

## Data sources (verified counts)

| File | Drives | Count |
|---|---|---|
| `src/app/camera-finder/data/cameras.ts` | Camera Finder | 18 |
| `src/app/spec-lookup/data/specs.ts` | Spec Filter | 20 |
| `src/data/camera-list.ts` | Display Issues | 14 (3 wall sections) |
| `src/data/display-slots.ts` | OOS | cameras + lenses |
| `src/data/basket-genres.ts` | Basket Builder | 6 genres |
| `src/data/cage-fights.ts` | Cage Fights | 3 |

---

## What's solid

- Clean App Router structure; core tools all work.
- MongoDB connection is pooled correctly (singleton via `globalThis`, no per-request client).
- User data is row-scoped by `ownerId`; sessions are proper `jose` JWTs in an httpOnly cookie.
- AI routes have per-user rate-limiting + a rationale cache.
- TypeScript compiles clean (`tsc --noEmit` passes).

## Items to address

### 1. Identity / persistence model — the core open question
Currently login-gated with per-user MongoDB records. Dean wants no-login persistence with cross-device recovery. This is the main thing to decide before other work. (See `proxy.ts:4` public prefixes; `dal.ts:23` `isEmailAllowed()` is a stub returning `true`; `api/admin/*` routes have no session check — `store-details/route.ts` even *imports* `requireSession` but never calls it. All fine given open-by-design intent, but should be made deliberate, not accidental.)

### 2. Real lint bugs (not just style)
- `basket-builder-client.tsx:17` — `setState` called in effect body; `:43` — missing `selectedGenre` dependency.
- `display-issues-client.tsx:73` — `handleSelectStore` used before its declaration (line 91).

### 3. Lint warnings (~28 total)
Unused imports (`Navbar` in several pages, `Link`, `GenreDefinition`, `ObjectId`, `requireSession` in store-details), ~9 unescaped JSX entities, 5 `any` types, 2 `prefer-const`.

### 4. Stale docs (defer until tools settle)
`OVERVIEW.md` + `SITEMAP.md` predate auth, MongoDB, Basket Builder, Spec Lookup, Cage Fights, All Issues. `README.md` is still default create-next-app boilerplate. `.env.example` is empty.

### 5. Three unreconciled camera lists
18 (finder) / 20 (spec) / 14 (display) are maintained by hand and don't share a source. Relevant because planned training pages will also want camera data.

### 6. Uncommitted work in progress
`display-issues/page.tsx` (adds `await requireSession()`) and `store-storage.ts` (`syncFromCloud` redirect-loop fix) — auth-hardening already started.

---

## Note on AI model string
One audit pass guessed `gpt-5.4-nano` was a fake/typo model. That is **past the auditor's knowledge cutoff (May 2025)** and was **not** treated as a confirmed bug. Verify the model string is current before changing it.
