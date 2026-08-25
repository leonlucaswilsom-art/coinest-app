# Security & Resilience Playbook (apply to every project)

This checklist is the combined playbook from two videos the owner asked to
implement:

- **@millee.md — the 20-point app-security checklist** (`#appsecurity`)
- **@amospikins — "your infrastructure is your survival system"**

Every new project built in this workspace gets **all of the items below**, same
as CoinNest. Status column shows what CoinNest has done. Where an item says
"config", it needs the user's keys.

---

## A. Security from day one (@millee.md's 20 points)

| # | Item | How to implement | CoinNest status |
|---|---|---|---|
| 1 | Hide API keys | Never hardcode secrets; read from `process.env` in Convex "use node" files | ✅ email relay key reads `VLY_EMAIL_API_KEY` |
| 2 | Secrets from env | Paste keys in the platform's Keys/API keys tab; reference by env var name | ✅ `VLY_EMAIL_API_KEY`, `TURNSTILE_SECRET_KEY` |
| 3 | Private database keys | Backend-only DB access (Convex); never expose admin credentials to the client | ✅ built-in |
| 4 | Row-level security | Every query/mutation scopes to `getAuthUserId(ctx)`; a user can only ever read/write their own rows | ✅ every function in `savings.ts` |
| 5 | Encrypt sensitive data | Convex Auth hashes/crypts auth secrets server-side | ✅ built-in |
| 6 | Session lock | Idle-timeout hook that signs the user out after 30 min inactive | ✅ `use-idle-signout.ts` |
| 7 | Record access | `auditLogs` table written only by server-side code (whitelisted events) | ✅ `audit.ts` + `logAuditEvent` |
| 8 | Block field tampering | Server-side validation of every arg (validators + explicit checks); never trust the client | ✅ `savings.ts` limits |
| 9 | Secure session cookies | httpOnly, secure cookies (Convex Auth default) | ✅ built-in |
| 10 | Hash passwords | Convex Auth (passwordless email codes + guest) | ✅ built-in |
| 11 | Rate-limit login | 5 failed attempts/hour, then cooldown | ✅ in auth setup |
| 12 | Bot protection | Cloudflare Turnstile on sign-in, verified server-side in a Convex action; activate only when keys are set | ✅ `turnstile.tsx` + `security.ts` — **needs keys** |
| 13 | Parameterize queries | No raw SQL anywhere (Convex query API) | ✅ built-in |
| 14 | Validate all input | Convex validators on every function arg + explicit range checks | ✅ |
| 15 | Escape user content | React auto-escaping; never `dangerouslySetInnerHTML` user data | ✅ |
| 16 | Restrict file uploads | No upload endpoints; if added later, whitelist types + size caps | ✅ N/A (no uploads) |
| 17 | Trim API responses | Only the signed-in user's own rows are ever returned; audit details capped at 200 chars | ✅ |
| 18 | Security headers | CSP + referrer policy meta tags in `index.html`; keep CSP scoped to app + Convex + Turnstile | ✅ |
| 19 | Force HTTPS | Platform-served HTTPS | ✅ |
| 20 | Scan dependencies | `bun audit` + upgrade everything flagged (had to force-pin `@auth/core` 0.41.x) | ✅ audit 19 → 2 |

**Activation keys the owner must supply (Keys/API keys tab):**

- `VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` → switches bot protection on
- `VLY_EMAIL_API_KEY` → production email relay key

---

## B. Survive pressure (@amospikins's infrastructure rules)

| Rule | Item | How to implement | CoinNest status |
|---|---|---|---|
| Traceability | "Can we prove everything that happened?" | Audit log on every state change + immutable history rows (savings table with `_creationTime`) | ✅ `auditLogs` + `savings` |
| **Build recovery** | **Idempotency** — "click pay 3× must not charge 3×" | Client sends one `requestKey` per action, reused on retry; server dedupes on `(userId, requestKey)` | ✅ `requestKey` on `addSaving` + `createGoal` |
| Build recovery | "What happens if the provider fails?" | Assume external services fail; retry with the same idempotency key; log provider responses | ✅ pattern documented in `OPS.md` |
| Backups | Weekly export + **tested restore** | `npx convex export` weekly; restore drill into a throwaway deployment | ✅ runbook in `OPS.md` |
| Monitoring | Structured logs + metrics | Convex dashboard Logs/Metrics; weekly error review | ✅ documented |
| Start simple | No microservices before logs/backups | Keep a single Convex backend; split only when the team/load demands it | ✅ |
| AI cost control | Track cost per request; monitor wrong answers; survive provider downtime; cap spend per user | Log prompt + model + tokens + cost + latency per call (`aiCalls` table); per-day usage caps enforced server-side (`aiUsage`); env-gated so a missing key fails gracefully instead of crashing | ✅ AI Coach + Meme Signal board ship with all of it (see `src/convex/ai.ts` + `aiActions.ts`) |
| Payments | Log provider response, webhook arrival, credit; reconcile | Before Stripe goes live: idempotent webhook handler + audit entries for every payment event | ⏳ pricing is next milestone |
| CI/CD | Automatic build + check on every change | Platform runs `convex dev --once` + `tsc --noEmit` per turn | ✅ |
| No Friday deploys | Test after deploy; fresh backup before big changes | Change rules in `OPS.md` | ✅ documented |

---

## C. SEO / publishability (so the app can be found)

- `public/robots.txt` — allow crawl + point at sitemap
- `public/sitemap.xml` — homepage + privacy policy
- `index.html` — title, description, Open Graph + Twitter meta tags
- Google Search Console verification: add `google-site-verification` meta tag when the owner provides the code

---

## D. Per-project bootstrap order (new project = run this)

1. **Deps:** `bun audit`; upgrade flagged packages; force-pin patched versions via overrides if needed. Remove dead entrypoints that pull vulnerable transitive deps.
2. **Auth:** passwordless/guest via Convex Auth; rate-limit login (5/hr); secure cookies (default).
3. **RLS:** scope every query/mutation to `getAuthUserId(ctx)`.
4. **Audit:** copy `src/convex/audit.ts` + `auditLogs` table; wire events into every mutation.
5. **Bot protection:** copy `turnstile.tsx` + `security.ts`; env-gated so sign-in works without keys.
6. **Session lock:** copy `use-idle-signout.ts`; mount in the protected dashboard.
7. **Idempotency:** `requestKey` (optional, validated) on every create mutation; client reuses the key on retry, invalidates it on input change.
8. **Headers:** CSP + referrer meta in `index.html` (scope to app + Convex + Turnstile).
9. **Input limits:** validators on every arg; cap string lengths; reject non-finite numbers.
10. **SEO:** robots.txt, sitemap.xml, OG/Twitter meta.
11. **Docs:** write `OPS.md` (monitoring + backup + restore drill) and this checklist for the project.
12. **Verify:** `bun convex dev --once && bun tsc -b --noEmit`; then review Logs for errors.
