# CoinNest — Source Setup & Deployment Guide

This folder contains the complete source for **CoinNest**, the crypto savings tracker
(React + Vite + TypeScript frontend, Convex backend, Convex Auth with email OTP +
anonymous sign-in, anti-brute-force rate limiting).

## 1. Install dependencies

```bash
npm install
# or, if you use Bun:
bun install
```

## 2. Environment variables

Create a `.env.local` file in the project root with at least:

```
VITE_CONVEX_URL=https://limitless-rhinoceros-478.convex.cloud
```

Two options for the backend:

- **Keep the existing backend (fastest).** Use the URL above. The Convex database
  already has the schema, functions, and any user data deployed — the app works
  immediately. You can manage your Convex deployment at
  https://dashboard.convex.dev
- **Create your own backend.** Sign up at https://convex.dev, then run
  `npx convex dev` inside this folder. It creates a new project, pushes the
  schema/functions, and prints a new deployment URL — put that in
  `VITE_CONVEX_URL` instead.

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173

## 4. Build & deploy

The frontend is a static build; the backend lives on Convex (no server to run).

```bash
npm run build   # outputs static files to dist/
```

Deploy `dist/` to any static host — Vercel, Netlify, Cloudflare Pages, etc. Point
your custom domain at it. The Convex backend stays as-is.

## 5. Notes

- **Email OTP**: sign-in codes are sent through the freebuff.app relay by default
  (`src/convex/auth/emailOtp.ts`). For a fully standalone deployment, replace
  `sendVerificationRequest` with your own email provider (e.g. Resend) and manage
  its API key through your host's env vars.
- **vly-toolbar-readonly.tsx** is Freebuff's dev toolbar. It only activates on
  `.vly.sh` hostnames and is inert everywhere else — safe to keep or delete.
- **Auth**: config lives in `src/convex/auth.config.ts` — email OTP + anonymous
  sign-in, limited to 5 failed verification attempts per hour with a cooldown.
- **Data model**: `users`, `savings`, `goals` tables in `src/convex/schema.ts`;
  every query/mutation is scoped to the signed-in user.
