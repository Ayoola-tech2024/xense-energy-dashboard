# AGENTS.md

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **xense energy** (API base `https://kugpe8zm.us-east.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

<!-- SESSION CHECKPOINT (2026-07-18): Hardware Simulation System -->
## Built — Hardware Simulation Engine

### Files
- `scripts/simulate.ts` — Standalone CLI script that mimics ESP32 hardware. Run with: `npx tsx scripts/simulate.ts --interval 3000`
  - Posts realistic energy readings to InsForge's `energy_readings` table every N seconds
  - Auto-creates device `esp32-xs-001` in `devices` table on first tick
  - Models: solar bell curve, battery charge/discharge, load by time-of-day, cloud cover, grid flicker
  - Stop with Ctrl+C. Data persists in DB.
- `src/lib/api-service.ts` — `fetchLiveData()` column mapping fixed: `solar_voltage → pv_voltage`, `battery_soc → battery_percent`, `energy_today → today_production`, `grid_available → grid_status`, etc.
- `src/app/page.tsx` — Dashboard polls InsForge every 3 seconds for live updates.

### To test locally
1. Terminal 1: `npm run dev`
2. Terminal 2: `npx tsx scripts/simulate.ts --interval 3000`
3. Open `http://localhost:3000`

### Pending (next session)
- **Deploy to Vercel** — push to GitHub remote, connect Vercel, get live URL
- Send the URL + anon key to the embedded systems engineer so they can test against the same endpoint
<!-- END SESSION CHECKPOINT -->
