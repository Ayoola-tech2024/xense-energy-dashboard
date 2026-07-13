# Xense Energy Dashboard — Project Memory

> **Last updated:** July 13, 2026
> **Purpose:** Persistent project documentation so Buffy (AI assistant) can pick up where it left off across sessions.

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project** | Xense Energy — Intelligent Load Control |
| **Stack** | Next.js 16.2.10 + React 19.2.4 + TypeScript 5 + Tailwind CSS 4 |
| **Deployment** | [Vercel](https://xense-energy-dashboard.vercel.app/) |
| **GitHub** | [Ayoola-tech2024/xense-energy-dashboard](https://github.com/Ayoola-tech2024/xense-energy-dashboard) |
| **Local path** | `C:\Users\USER\Desktop\Xense Energy` |

---

## 2. Git History

| Commit | Message |
|--------|---------|
| `87f0716` | `fix: resolve TypeScript error in layout.tsx - remove onLoad string attribute on link tag` |
| `8bffd5e` | `feat: implement full Xense Energy dashboard` |
| `5c1edfa` | `Initial commit from Create Next App` |

**Status:** ✅ All local changes committed and pushed to `origin/master`.

---

## 3. What's Been Built (Feature Checklist)

### Pages
| Page | Route | Status |
|------|-------|--------|
| Overview Dashboard | `/` | ✅ Complete |
| Analytics | `/analytics` | ✅ Complete |
| AI Decisions | `/decisions` | ✅ Complete |
| Devices | `/devices` | ✅ Complete |
| Automation Rules | `/automation` | ✅ Complete |
| Priority List | `/priority` | ✅ Complete |
| Notifications | `/notifications` | ✅ Complete |
| Settings | `/settings` | ✅ Complete |

### Reusable Components
| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `src/components/sidebar.tsx` | Navigation sidebar with mobile overlay |
| Header | `src/components/header.tsx` | Top bar with search, notifications, theme toggle |
| StatCard | `src/components/stat-card.tsx` | KPI metric card (solar, load, grid, CO₂) |
| SimpleChart | `src/components/simple-chart.tsx` | SVG area chart for production vs consumption |
| BatteryGauge | `src/components/battery-gauge.tsx` | Circular battery gauge SVG |
| ModeSelector | `src/components/mode-selector.tsx` | Xense / Bypass / Auto mode buttons |
| DeviceTable | `src/components/device-table.tsx` | Device list with status, mode, relay controls |
| DecisionCard | `src/components/decision-card.tsx` | AI decision card with status and confidence |
| AutomationRuleCard | `src/components/automation-rule.tsx` | Automation rule card with toggle |

### Data Layer
| File | Purpose |
|------|---------|
| `src/lib/types.ts` | All TypeScript interfaces (LiveData, Device, AiDecision, etc.) |
| `src/lib/mock-data.ts` | Mock dashboard data for development |
| `src/lib/api-service.ts` | API service layer (mock now, ready for real backend) |

---

## 4. Architecture & Design

- **Styling:** Tailwind CSS 4 with a custom dark theme (`#0b0e14` background)
- **Icons:** Font Awesome 6.5.1 (loaded from CDN)
- **Fonts:** Geist Sans + Geist Mono (via Next.js font optimization)
- **State:** Client-side React state with `useState` + `useEffect`
- **API:** Service layer pattern — `api-service.ts` currently uses mock data, ready to swap in real API calls
- **Routing:** Next.js App Router with pages under `src/app/`

### Color Palette
- Background: `#0b0e14`
- Surface: `#12171f`
- Borders: `#1e293b`
- Text Primary: `#e8edf5`
- Text Muted: `#8899b4` / `#5a6d8a`
- Teal Accent: `#2dd4bf`
- Solar/Production: `#fbbf24` (amber)
- Load/Consumption: `#60a5fa` (blue)
- Success: `#34d399` (green)
- Error: `#f87171` (red)
- AI/Priority: `#a78bfa` (purple)

---

## 5. Deployment

| Detail | Value |
|--------|-------|
| **Platform** | Vercel |
| **URL** | https://xense-energy-dashboard.vercel.app/ |
| **Framework preset** | Next.js (auto-detected) |
| **Build command** | `next build` (default) |
| **Status** | ✅ Live — last successful deploy from `87f0716` |
| **Git integration** | Auto-deploys on push to `master` |

---

## 6. Known Issues / To-Do

### Completed Fixes
- ✅ Fixed TypeScript error: `onLoad="this.media='all'"` on `<link>` tag changed to regular stylesheet link

### Future Improvements (Not Started)
- [ ] Replace mock data with real API (see `api-service.ts` — endpoints documented with comment markers)
- [ ] Add loading skeletons for each page (currently just a spinner)
- [ ] Implement search functionality in header
- [ ] Add real-time WebSocket updates for live data
- [ ] Add user authentication
- [ ] Add theme toggle (dark/light mode — button exists but not wired)
- [ ] Responsive polish for very small screens
- [ ] Unit tests for components
- [ ] Add vercel.json configuration for fine-tuned deployment settings

---

## 7. How to Run Locally

```bash
cd "C:\Users\USER\Desktop\Xense Energy"
npm run dev     # Development server on http://localhost:3000
npm run build   # Production build
npm run start   # Serve production build
```

---

## 8. Vercel Deployment Notes

- The build failed initially on commit `8bffd5e` due to the TypeScript `onLoad` error
- The fix was pushed in commit `87f0716`
- May need manual redeploy from Vercel dashboard if auto-deploy doesn't trigger
- Vercel CLI is installed (v54.18.5) but not logged in on this machine
