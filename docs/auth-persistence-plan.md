# Auth + Persistence Migration Plan

Living document. Updated as work progresses. Intended to let any future Claude session pick up without re-deriving context.

## Decisions locked in

- **Auth**: **Custom magic-link** using `jose` for session JWTs + native Next.js `cookies()` API + Resend SDK for delivery. No Auth.js. Chosen because Next 16's own auth guide uses this pattern; it's ~150 lines; and it sidesteps Auth.js v5's Next-16-compat risk. Long-lived session cookie (30 days).
- **Database**: MongoDB Atlas, official `mongodb` Node driver. **Do not use Mongoose.** Zod at API boundary.
- **Ownership model**: per-user. Every document owned by `ownerId` (Mongo users `_id`). No teams, no memberships, no sharing.
- **Store uniqueness**: `(ownerId, number)`, not `number` alone. Two users can each own a "0148"; neither overwrites the other.
- **OOS reset**: client-computed "business day" key (PST day, rolling at 02:00). Stored alongside state; mismatch on load → wipe. No Mongo TTL, no cron.
- **Static-data remains in source**: cameras, specs, cage-fights, display-slot layouts. Only *user-generated* data goes to Mongo.
- **Offline posture**: optimistic UI + localStorage write-through cache. Failed writes surface a toast; no complex queue. Retail wifi is usable, not great.

## Next.js 16 gotchas (this project is on 16.2.4)

- **`middleware.ts` → `proxy.ts`**, function named `proxy`. Node.js runtime only. Edge not supported here. This means Mongo driver works fine inside proxy (but per Next's own guidance, proxy should only do *optimistic* session-cookie reads, not DB queries).
- **Async request APIs**: `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are all `Promise` now. Every access must `await`.
- **No `next lint`** — our `package.json` already uses `eslint` directly.
- **Turbopack is default** for `next dev` and `next build`. No `--turbopack` flag needed.
- **React 19.2 canary** in App Router. `useEffectEvent` now available for Effect-Event pattern.
- **Parallel route slots require `default.js`** — not relevant for us (no parallel routes), but flag if we add any.

## Mongo collections

```
users                    // { _id, email (unique), createdAt, lastLoginAt }
loginTokens              // { _id, userId, tokenHash, expiresAt, consumedAt? }
                         // TTL index on expiresAt for auto-cleanup

stores                   // { _id, ownerId, number: "0058", nickname?, address?, lat?, lng?, createdAt, updatedAt }
                         // unique index: (ownerId, number)

storeIssues              // { _id, ownerId, storeId, cameras: Record<cameraName, CameraIssues>, updatedAt }
                         // unique index: (ownerId, storeId)

oosState                 // { _id, ownerId, businessDay: "YYYY-MM-DD", checked: Record<string, boolean>, updatedAt }
                         // unique index: (ownerId)  — one active doc per user, overwritten per day
```

Every query filters by `ownerId` from session. No exception.

## What stays on the client

- `sony-toolkit-active-store` → localStorage. UI preference only.
- `sony-toolkit-geo-denied` → localStorage. Device preference.
- Camera Finder wizard state → `useState`. One-shot, customer-facing.
- Spec Lookup filters/sort → `useState`. Ephemeral.
- Optional write-through cache of last-seen Mongo state → localStorage, keyed by `ownerId`.

## API surface (all session-gated via middleware)

```
POST   /api/auth/[...nextauth]      // Auth.js
GET    /api/stores
POST   /api/stores                  // create
PUT    /api/stores/:id              // update
DELETE /api/stores/:id
GET    /api/stores/:id/issues
PUT    /api/stores/:id/issues       // whole-map upsert
GET    /api/oos                     // returns {} if businessDay mismatch
PUT    /api/oos                     // upserts single doc per user
POST   /api/import                  // one-shot migration from localStorage
POST   /api/generate-rationale      // existing — gains session check
```

## Phased build

### Phase 1 — infrastructure
- Add deps: `next-auth@beta` (or `@auth/core` + `@auth/mongodb-adapter`), `mongodb`, `nodemailer` (for magic link transport).
- `src/lib/db.ts` — Mongo client singleton with HMR-safe pattern.
- `src/lib/auth.ts` — Auth.js config + `auth()` export.
- `src/app/api/auth/[...nextauth]/route.ts`.
- `src/middleware.ts` — redirect unauthenticated to `/login`; gate `/api/*` except auth.
- `src/app/login/page.tsx` — magic link form.
- Env additions: `MONGODB_URI`, `AUTH_SECRET`, email SMTP creds (or Resend API key).
- Deploy gate: auth works, unauth user gets redirected, `/api/generate-rationale` returns 401 without session.

### Phase 2 — stores + issues port
- `src/app/api/stores/**` + `src/app/api/stores/[id]/issues/route.ts`.
- Rewrite `src/lib/store-storage.ts` as an async fetch layer. Keep geolocation utilities (`haversineDistance`, `findNearestStore`) as-is.
- Split the load effect in `display-issues-client.tsx` into mount-only (fetch stores) and URL-reactive (react to `?locate=true`). Drops the `set-state-in-effect` disable risk once network work happens there.
- Add write-through localStorage cache keyed by `ownerId` so reloads render stale data instantly.
- Import flow: on first login, detect legacy `sony-toolkit-*` keys, POST to `/api/import`, clear the keys.

### Phase 3 — OOS persistence
- `oosState` collection + routes.
- `src/app/oos/oos-form.tsx` gains load/save hooks with the business-day check.
- `businessDay()` helper:
  ```ts
  const businessDay = () =>
    new Date(Date.now() - 2 * 3600_000)
      .toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  ```

### Phase 4 — sign-out, account UI, polish
- Sign-out button in navbar.
- `/account` page (optional) — email, sign-out, delete-my-data button.
- Remove dead localStorage code paths after verifying migration works.

## Risks / watch-outs

- **Next.js 16**: verify Auth.js v5 compatibility with the app's Next 16 + React 19.2 stack. Per `AGENTS.md`, always consult `node_modules/next/dist/docs/` for route/middleware conventions before writing auth routes.
- **Cold-start cost of mongodb client on Vercel**: use the HMR/dev singleton pattern; in prod, connection pooling handles it.
- **Magic-link deliverability**: SMTP via Resend or a real transactional provider, not a gmail app password.
- **Rate-limit `/api/generate-rationale`** even after auth — a logged-in rep's compromised session shouldn't be able to burn unlimited OpenAI credits. Simple per-session counter in Mongo or Vercel KV.
- **Photon (komoot.io)** in `address-autocomplete.tsx` is free and unauthed — fine as-is.

## Migration: localStorage → Mongo

Trigger: user logs in for the first time AND `sony-toolkit-stores` exists in localStorage.

UI: one-time dialog listing the stores + issue counts that will be uploaded. Import button posts to `/api/import`. On success, clear the imported keys (but keep `active-store` and `geo-denied`).

Conflict handling: none needed. Per-user ownership + first-import means the user's Mongo state starts empty. Direct overwrite.

## Out of scope (explicitly not doing)

- Teams / shared stores.
- Real-time sync between devices (Mongo Change Streams, websockets). Reload-to-see-latest is fine.
- Offline-first with conflict resolution. Optimistic + retry only.
- Password-based auth. Magic link only.
- Email verification flow beyond the magic link itself.
