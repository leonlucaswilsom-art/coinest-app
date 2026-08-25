# CoinNest 🪺

**The calm, simple way to track your crypto savings.**

CoinNest helps crypto beginners build the savings habit — log what you set aside, set goals, keep your streak, and watch your savings grow. No jargon, no pressure, no trading noise.

## Features

- 📊 **Savings Tracker** — Log any coin, any amount, see your progress
- 🎯 **Goals** — Set named targets with progress bars
- 🔥 **Streaks** — Build the daily savings habit
- 🤖 **AI Coach** — Personalized savings insights (powered by Perplexity)
- 📡 **Meme Signal Board** — Trending coin scanner (powered by CoinGecko)
- 📈 **Savings Chart** — Visualize your growth over time
- 📥 **CSV Export** — Download your data anytime (GDPR compliant)
- 🔒 **Enterprise Security** — Audit logs, bot protection, rate limiting, session lock

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Convex (real-time database + serverless functions)
- **Auth:** Convex Auth (email OTP + anonymous sign-in)
- **AI:** Perplexity Sonar (AI Coach) + CoinGecko (Meme Signals)

## Quick Deploy (5 minutes)

### Step 1 — Upload to GitHub

1. Download `coinnest-source.zip` from this repo
2. Unzip it on your computer
3. Go to **github.com** → **New repository** → name it `coinnest` → **Public** → **Create**
4. Click **"uploading an existing file"** → drag all unzipped files in → **Commit changes**

### Step 2 — Deploy to Vercel (free)

1. Go to **vercel.com** → **Sign up** with your GitHub account
2. Click **"Add New Project"** → find your `coinnest` repo → **Import**
3. Leave the defaults (Build: `npm run build`, Output: `dist`)
4. **Add environment variable:**
   - Name: `VITE_CONVEX_URL`
   - Value: `https://limitless-rhinoceros-478.convex.cloud`
   - Apply to: Production, Preview, and Development
5. Click **Deploy** → wait 1–2 minutes
6. You get `coinnest.vercel.app` — done! 🎉

### Alternative: Netlify or Cloudflare Pages

See [DEPLOY.md](DEPLOY.md) for step-by-step instructions for Netlify and Cloudflare Pages.

## Local Development

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env.local
# Edit .env.local → set VITE_CONVEX_URL

# Start dev server
bun run dev
```

## Project Structure

```
src/
├── components/         # UI components
│   ├── dashboard/      # Dashboard widgets (AI Coach, Meme Signals, etc.)
│   └── ui/             # shadcn/ui primitives
├── convex/             # Backend (database schema, functions, auth)
├── hooks/              # Custom React hooks
├── lib/                # Utilities
├── pages/              # Route pages (Landing, Auth, Dashboard, etc.)
└── main.tsx            # App entry point + router
```

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `VITE_CONVEX_URL` | Frontend (.env.local) | Convex backend URL |
| `PERPLEXITY_API_KEY` | Convex (server-side) | AI Coach (optional) |
| `VITE_TURNSTILE_SITE_KEY` | Frontend | Cloudflare bot protection (optional) |
| `TURNSTILE_SECRET_KEY` | Convex (server-side) | Bot protection verification (optional) |

## License

All rights reserved. This is proprietary software.
