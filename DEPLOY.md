# Deploying CoinNest to Free Hosting

Goal: put the CoinNest code on **Vercel, Netlify, or Cloudflare Pages** (all free) so you
get a public URL like `coinnest.vercel.app`. Your Convex backend stays exactly as-is —
nothing changes, and existing user data keeps working.

**You'll need:** the code (`coinnest-source.zip` in this project root), a free **GitHub**
account, and a free account at whichever host you pick.

---

## Path A — Vercel (recommended, easiest)

### Step 1. Get the code onto GitHub

**Option 1 — from the zip:**
1. Download `coinnest-source.zip` and unzip it on your computer.
2. Go to **github.com** → **+ / New repository** → name it `coinnest` → **Public** → **Create repository**.
3. On the new empty repo page, click **"uploading an existing file"** → drag the unzipped
   files and folders in → **Commit changes**.

**Option 2 — no zip needed:**
- In Freebuff, use the **one-click GitHub export** (shown on the project page) if available.
- The repo is created for you — skip to Step 2.

### Step 2. Create a Vercel account
1. Go to **vercel.com** → **Sign up** with your GitHub account → **Free** plan.

### Step 3. Import the project
1. Vercel dashboard → **Add New Project** → find your `coinnest` repo → **Import**.
2. Vercel auto-detects **Vite**. Leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`

### Step 4. Add the environment variable (critical)
1. **Project → Settings → Environment Variables** → **Add**:
   - Name: `VITE_CONVEX_URL`
   - Value: `https://limitless-rhinoceros-478.convex.cloud`
   - Apply to: **Production, Preview, and Development**

### Step 5. Deploy
1. Click **Deploy**. Wait 1–2 minutes.
2. You get a URL like `coinnest.vercel.app`. (Rename it under **Settings → Domains** if you want.)

### Step 6. Done 🎉
- The app runs on Vercel; the Convex database and sign-in emails keep working unchanged.

---

## Path B — Netlify (alternative)

1. **netlify.com** → **Sign up** with GitHub (free).
2. **Add new site → Import an existing project → From Git** → pick the `coinnest` repo.
3. Build command: `npm run build` · Publish directory: `dist`.
4. **Site settings → Environment variables** → add `VITE_CONVEX_URL` =
   `https://limitless-rhinoceros-478.convex.cloud`.
5. **Deploy**. URL looks like `coinnest.netlify.app`.

---

## Path C — Cloudflare Pages (alternative)

1. **dash.cloudflare.com** → sign up (free).
2. **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build command: `npm run build` · Build output directory: `dist`.
4. **Settings → Environment variables** → add `VITE_CONVEX_URL` =
   `https://limitless-rhinoceros-478.convex.cloud`.
5. **Save and Deploy**. URL looks like `coinnest.pages.dev`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails with a Node/engine error | Set the **Node.js version to 22.x** in the host's project settings |
| Deploys but page is blank | The `VITE_CONVEX_URL` env var is missing or only set for one environment — check Settings → Environment Variables |
| Logged-in data missing | Confirm `VITE_CONVEX_URL` is exactly `https://limitless-rhinoceros-478.convex.cloud` (the existing backend) |
| Sign-in code emails don't arrive | The relay needs a few minutes; if it persists, see `SETUP.md` §5 about the email sender |

---

## Extra

- Want a custom domain later (e.g. `coinnest.com`)? Buy it at a registrar, then add it under
  the host's **Domains** section — the host shows you the exact DNS records to set.
- When we add **pricing** (Stripe), the keys go in the host's environment variables too.
