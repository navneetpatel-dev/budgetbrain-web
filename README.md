# BudgetBrain Web

Next.js App Router web application for BudgetBrain — AI-powered personal finance and expense tracking.

**Related apps:** [backend](../backend) · [mobile](../mobile) · [admin](../admin)

## Architecture & Conventions

This web application strictly follows:
- [`structure/web-admin/WEB-STRUCTURE-CONVENTIONS.md`](../../structure/web-admin/WEB-STRUCTURE-CONVENTIONS.md)
- [`structure/web-admin/NEXTJS-STRUCTURE-CONVENTIONS.md`](../../structure/web-admin/NEXTJS-STRUCTURE-CONVENTIONS.md)

### Hierarchy
```
src/
├── app/                  # Route layer (thin page re-exports, layouts, error/loading boundaries)
├── features/             # Feature domains (pages, components, hooks, api, styles, types)
└── shared/               # Cross-feature reusable code (theme, store, services, containers, ui)
```

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS with centralized design tokens (`globals.css`, `tailwind.config.ts`)
- **State Management:** Redux Toolkit + Redux Persist
- **Server Cache & Async State:** TanStack React Query (v5)
- **Forms:** React Hook Form + custom validation (`fieldLimits`)
- **Icons & Motion:** Lucide React, Framer Motion

## Prerequisites

- Node.js 18+ and npm
- Running BudgetBrain API server (`backend/` on port 3002)

## Quick Start

```bash
# 1. Clone & enter web directory
cd web

# 2. Copy environment template
cp .env.example .env.local

# 3. Install dependencies
npm install

# 4. Start local development server (port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3002/api/v1` | BudgetBrain Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | *(Optional)* | Google OAuth Web Client ID |
| `NEXT_PUBLIC_APPLE_CLIENT_ID` | *(Optional)* | Apple Services ID for Sign in with Apple |
| `NEXT_PUBLIC_APPLE_REDIRECT_URI` | `window.location.origin` | Return URL configured on Apple Services ID |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server (`next dev -p 3000`) |
| `npm run build` | Compile production standalone bundle (`next build`) |
| `npm run start` | Run production server (`next start -p 3000`) |
| `npm run lint` | Run ESLint check across all files |

## Deployment & Hosting

The app is configured with `output: 'standalone'` in `next.config.ts`:
- **Docker / EC2 / Node:** Run `node .next/standalone/server.js` behind Nginx or CloudFront.
- **Vercel / Cloud Platforms:** Seamless deployment via standard Next.js build pipeline.
