# CoinNest — Operations Runbook

Infrastructure is your **survival system**, not decoration. This runbook covers the
three things a small money app must be able to do: **watch itself**, **prove what
happened**, and **come back from a disaster**.

---

## 1. Monitoring (watch the app)

All app functions (queries, mutations, auth, background work) run through Convex,
which logs **every invocation** — success/failure, duration, and error message.

- Open your deployment dashboard:
  `https://dashboard.convex.dev/t/freebuff/<project-id>/<deployment-name>`
- **Logs tab** → live stream of every function call. Filter by error to see
  failures; look at `duration` to spot slow queries.
- **Metrics tab** → request volume, error rate, and latency over time.
- **Health check** → hit `https://<deployment>.convex.cloud/.well-known/health`
  any time; a `200 OK` means the backend is alive.

**Rule of thumb:** check the Logs tab filtered to errors once a week. A sudden
spike of `"That goal doesn't exist"` or `"Please sign in"` errors usually means a
bug, not an attack.

---

## 2. Audit logs (prove what happened)

Every important event is written to the `auditLogs` table **server-side only** —
a caller can never invent an entry, only the app's own code paths can.

| Event | Meaning |
|---|---|
| `login` / `login_guest` | User signed in (email code or guest) |
| `logout` | User signed out (or idle-timeout) |
| `saving_added` / `saving_deleted` | Savings entry created / removed |
| `goal_created` / `goal_completed_toggled` / `goal_deleted` | Goal changes |

**To review:** Dashboard → **Data** → `auditLogs` table. Filter by `userId` to
reconstruct a single user's full history. Combined with the `savings` and `goals`
tables (which carry Convex's built-in `_creationTime`), you can answer "who did
what, and when" for any account.

This is the same pattern you'll extend when payments go live: log the payment
provider's response, the webhook arrival, and the credit — so "I paid but my
balance didn't change" becomes a 2-minute lookup instead of a mystery.

---

## 3. Backup + **tested** restore

> "If you build backup and you no try restore, that be decoration."

A backup you have never restored is not a backup. Convex stores your data in a
managed database; you still own the export.

### 3a. Take a backup (do this weekly, and before any big change)

```bash
npx convex export --path ./backup-$(date +%Y-%m-%d)
```

- Creates a folder with one JSONL file per table (users, savings, goals,
  auditLogs, auth tables).
- Store it somewhere **outside this project** — download the folder, or push it
  to a private repo / Google Drive / Dropbox.
- Convex paid plans also take **automatic daily snapshots** (Dashboard → Backup).
  The manual export above works on every plan and is your safety net.

### 3b. Restore drill (do this at least once — today is a good day)

Practice restoring into a throwaway deployment so you *know* it works:

1. Create a new Convex deployment (or use a test team): `npx convex dev --team <test-team>`
2. Import your latest export:
   ```bash
   npx convex import --path ./backup-YYYY-MM-DD
   ```
3. Verify: sign in as one of your test users and confirm their savings, goals,
   and audit history are all present.
4. If step 3 passes, your backup is real. If it fails, fix it now — not during
   an outage.

### 3c. The full restore (if the production deployment is ever lost)

1. Create a fresh deployment in Convex.
2. Run `npx convex import --path ./backup-YYYY-MM-DD` against it.
3. Update the frontend's `VITE_CONVEX_URL` to the new deployment URL and redeploy.
4. Verify logins + data, then announce recovery.

---

## 4. Incident response (the 10-minute checklist)

When something looks wrong:

1. **Is it the backend?** Check `https://<deployment>.convex.cloud/.well-known/health`.
2. **Is it the frontend?** Open the app in a private window; check the console.
3. **Is it a specific user?** Pull their rows from `savings` + `auditLogs` and
   reconstruct the sequence of events.
4. **Double-counted anything?** Savings writes carry an idempotency `requestKey`;
   a duplicate submit is deduped server-side. If you still see a duplicate,
   delete the extra `savings` row and the matching `saving_added` audit row.
5. **Dependency alarms?** Run `bun audit` and upgrade anything flagged.
6. **Recovery needed?** Follow 3b/3c.

---

## 5. Change rules

- **No Friday launches with "too much confidence."** Deploy mid-week, test after,
  and keep a fresh export from 3a before deploying.
- After any change to `src/convex/`, run `bun convex dev --once && bun tsc -b --noEmit`
  and watch the Logs tab for errors on the new functions.
- When payments launch: add webhook handling with **idempotency keys** (same
  pattern as `requestKey` here) and log every provider response to `auditLogs`.
