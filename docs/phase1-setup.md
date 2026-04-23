# Phase 1 setup — what Dean needs to do to run it

Phase 1 is **code-complete**. To run locally or deploy, you need to provision external services and add env vars. Nothing in this phase changed user-visible behavior except:

- All tool pages now redirect to `/login` if you're not signed in.
- `/api/generate-rationale` returns 401 if you're not signed in.
- Navbar shows a "Sign out" button when signed in.

Until you complete the setup below, the app will bounce everyone to `/login` and login will not work (no Mongo, no email). That's fine — it just means the tools are inaccessible until setup finishes.

## 1. Provision MongoDB Atlas

- Create a database (or reuse). Name it `sony-toolkit` (or anything — match with `MONGODB_DB` below).
- Grab the SRV connection string. Example: `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`.
- Whitelist your IP (or 0.0.0.0/0 for Vercel). Vercel integration handles the latter automatically if you use it.
- No schema migration needed. The first login call creates collections and indexes lazily.

## 2. Provision Resend

- Sign up at https://resend.com. Free tier is 3,000 emails/month — plenty.
- Create an API key.
- For `EMAIL_FROM`:
  - **Dev**: use `Sony Toolkit <onboarding@resend.dev>`. Resend accepts this without domain verification.
  - **Prod**: verify a domain you own, then use something like `Sony Toolkit <auth@sharpsightedstudio.com>`.

## 3. Add env vars to `.env.local`

Keep what's there. Add:

```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB=sony-toolkit

# Generate once. Keep secret. Rotating it invalidates all existing sessions.
SESSION_SECRET=<run: openssl rand -base64 32>

RESEND_API_KEY=re_...
EMAIL_FROM=Sony Toolkit <onboarding@resend.dev>

APP_URL=http://localhost:3000

# Your email(s), comma-separated. Anyone not on this list silently gets no email.
AUTH_ALLOWED_EMAILS=dean@sharpsightedstudio.com
```

On Vercel, set the same vars in the project settings. Use `APP_URL=https://<your-vercel-domain>` there.

## 4. Run it

```
npm run dev
```

Visit http://localhost:3000. You'll be redirected to `/login`. Enter your email. Check inbox. Click link. Land on the dashboard, signed in for 30 days.

## What's in place

- Magic-link auth. 15-minute single-use tokens, stored as SHA-256 hashes. Mongo TTL auto-cleans them.
- Session cookie: HS256 JWT, HttpOnly, SameSite=Lax, 30-day expiry. `sony-session`.
- `proxy.ts` redirects unauthenticated traffic to `/login` for every non-public path.
- `src/lib/dal.ts` is the one place session is read on the server. Memoized per request via React `cache()`.
- `/api/generate-rationale` is session-gated — no more open OpenAI endpoint.
- Email allowlist prevents anyone outside `AUTH_ALLOWED_EMAILS` from signing in (silent no-op to avoid enumeration).

## What's NOT in place (Phase 2+)

- User data is still in `localStorage`. The `store-storage.ts` module hasn't changed yet.
- No `/api/stores`, `/api/stores/[id]/issues`, or `/api/oos` routes yet.
- No migration prompt from localStorage → Mongo yet.
- No OOS persistence yet.

Follow [docs/auth-persistence-plan.md](./auth-persistence-plan.md) for the full roadmap.

## Known pre-existing issues (not from Phase 1)

`eslint src/` surfaces 12 errors + 5 warnings, all in files Phase 1 didn't touch:

- `src/app/cage-fight/[slug]/page.tsx` — unused `Link` import + unescaped quotes.
- `src/app/camera-finder/client.tsx` — unused `error` and `canProceed`.
- `src/app/camera-finder/engine.ts` — `let` that could be `const`.
- `src/app/spec-lookup/{data/specs.ts,spec-lookup-client.tsx}` — `any` usage, unused vars.
- Sass `darken()` deprecation warnings in `spec-lookup.module.scss` and elsewhere.

Not blocking. Clean up whenever.

## Files added

```
.env.example                               # env var documentation
docs/auth-persistence-plan.md              # master plan (updated)
docs/phase1-setup.md                       # this file
src/lib/db.ts                              # Mongo client singleton
src/lib/session.ts                         # jose JWT + cookie helpers
src/lib/email.ts                           # Resend wrapper
src/lib/auth-tokens.ts                     # magic-link token issue/consume
src/lib/dal.ts                             # getSession() / requireSession() / isEmailAllowed()
src/app/actions/auth.ts                    # requestLogin, logout server actions
src/app/login/page.tsx                     # email input page
src/app/login/login-form.tsx               # client form using useActionState
src/app/login/verify/page.tsx              # consumes ?token=, issues session, redirects to /
src/proxy.ts                               # optimistic redirect of unauth traffic
```

## Files modified

```
src/components/navbar.tsx                  # now async Server Component; shows Sign Out when logged in
src/app/api/generate-rationale/route.ts    # 401s without a session
package.json / package-lock.json           # added mongodb, jose, resend
```
