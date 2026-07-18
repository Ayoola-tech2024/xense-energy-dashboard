# Xense Energy — Complete Guide for a Busy Developer

> *Everything you need to know to build the dashboard, from first principles.*

---

## Part 1: What Is Xense Energy? (The Product)

**Problem:** In Nigeria/Africa, people use solar + batteries + grid. When battery runs low, you have to manually go unplug appliances (AC, freezer) to avoid draining the battery dead. It's annoying and easy to forget.

**Solution:** Xense Energy makes a **smart plug** that automatically cuts power to non-essential appliances when battery is low. It also turns them back on when solar is plentiful.

**The key difference from competitors:** Most solar products just *show you data* ("your battery is at 30%"). Xense actually *does something about it* — it controls the load intelligently. That's why the tagline is **"solar-intelligent load control"**, not just monitoring.

---

## Part 2: The Hardware (What Already Exists)

There are **two physical devices**:

### Device 1: The Dongle (Transmitter)
- A small box that connects directly to your **hybrid inverter**
- It reads electrical parameters from the inverter (battery %, solar power, etc.)
- Think of it as the "sensors" — it just collects data
- It sends this data over **WiFi** to...

### Device 2: The Smart Plug (Receiver)
- A power socket that you plug appliances into (like a regular smart plug)
- It receives data from the dongle
- Inside it has a **relay** — an electronic switch that can physically connect or disconnect power
- It runs the **decision logic** — a small program that says "if battery < 35%, open the relay"
- It also connects to the internet and sends data to the cloud

**Quick rule of thumb:**
- Dongle = measures and talks
- Smart Plug = listens and decides

---

## Part 3: How The Hardware Talks To The Dashboard

Here's the full data journey:

```
Step 1:   Inverter → Dongle (measures parameters)
              │
Step 2:   Dongle → Smart Plug (via WiFi, locally)
              │
Step 3:   Smart Plug → Cloud API (via internet)
              │
Step 4:   Cloud API → Your Dashboard (via HTTP/WebSocket)
```

### Step-by-step:

**Step 1 — The Dongle reads the inverter**
Every ~1-5 seconds, the dongle reads things like:
- Battery voltage: 48.2V
- Battery %: 72%
- Solar power: 1800W
- Grid status: "available" or "not available"
- Load power: 650W
- Temperature: 35°C
- etc. (about 20 data points total)

**Step 2 — Dongle sends data to Smart Plug**
The dongle and smart plug talk over **WiFi directly** (no internet needed). The smart plug receives this data and runs its decision logic locally.

**Step 3 — Smart Plug forwards data to Cloud API**
The smart plug also sends this data to a **Cloud API** over the internet. This is what the embedded specialist is building.

**Step 4 — Cloud API serves data to your Dashboard**
Your dashboard asks the API: "give me the latest data" and the API responds with JSON. The dashboard displays it.

---

## Part 4: What Is an API? (For Context)

An **API** is just a URL on the internet that returns data. Think of it like a waiter:

```
You (Dashboard)     →     "I want the latest reading"     →     API (Waiter)
You (Dashboard)     ←     "Here: { battery: 72, solar: 1800 }"  ←   API (Waiter)
```

The embedded specialist will build URLs like:

| URL | What it does |
|-----|-------------|
| `GET /api/devices` | List all smart plugs you own |
| `GET /api/devices/123/data` | Get latest readings for device 123 |
| `GET /api/devices/123/history` | Get historical data (for charts) |
| `POST /api/devices/123/mode` | Change mode (Xense/Bypass/Auto) |
| `POST /api/devices/123/relay` | Manually turn ON/OFF |

**JSON** is just a format — it looks like this:

```json
{
  "device_id": "esp32-001",
  "timestamp": "2026-07-08T14:30:00Z",
  "battery_percent": 72,
  "battery_voltage": 48.2,
  "solar_power": 1800,
  "load_power": 650,
  "grid_status": "available",
  "mode": "xense",
  "relay_state": "closed",
  "battery_temperature": 35,
  "inverter_temperature": 38,
  "frequency": 50.1,
  "ac_voltage": 230,
  "today_production": 4.2,
  "today_consumption": 2.1
}
```

---

## Part 5: What You Are Building (The Dashboard)

You are building a **web app** (dashboard) that:

### Must Do:
1. **Show live data** — Battery %, solar power, load, grid status — updated every few seconds
2. **Show the current mode** — Is it in Xense, Bypass, or Auto mode?
3. **Let users switch modes** — Click a button to change from Xense to Bypass
4. **Show relay state** — Is the smart plug ON or OFF?
5. **Show device status** — Is the smart plug online?

### Should Do:
6. **Charts** — Show daily/weekly/monthly solar production and consumption
7. **Device list** — If a user has multiple smart plugs, show them all
8. **Notifications** — Alert when battery is low, grid restored, device offline

### Nice To Have:
9. **Automation rules** — Let users create "IF battery > 80% THEN turn ON AC"
10. **AI decision cards** — Show why a decision was made (e.g., "AC OFF because battery < 35%")
11. **Priority list** — Let users rank appliances by importance

---

## Part 6: What You Need From The Embedded Specialist

You **cannot start building** until you have these answers. This is your task — go ask:

### The 7 Critical Questions:

1. **"What is the API base URL?"**
   - Where is the API hosted? (e.g., `https://api.xense.energy`)

2. **"Can I see a sample JSON response?"**
   - Give me the actual `curl` or a screenshot of what data looks like

3. **"Do I need authentication? How?"**
   - Do I send a token? An API key? Do users log in?

4. **"How often does the data update?"**
   - Every second? Every 5 seconds? Only when something changes?

5. **"Real-time or polling?"**
   - Can I use WebSocket (server pushes data to dashboard)?
   - Or do I need to keep asking (HTTP polling)?

6. **"Do you store history?"**
   - Can I get data from yesterday/last week?
   - Is there a history endpoint?

7. **"Can I control the device?"**
   - Is there an endpoint to change mode or turn relay ON/OFF?
   - What's the exact request format?

---

## Part 7: What You Need To Do (Step By Step)

### Phase 1: Get Answers (Do This FIRST)
- [ ] Send the 7 questions above to the embedded specialist
- [ ] Wait for his reply
- [ ] If any answer is unclear, ask for clarification

### Phase 2: Choose Your Stack
Recommended (matching your stack):
- **Frontend:** Next.js (App Router) — you use it already
- **Styling:** Tailwind CSS — you use it already
- **Charts:** Recharts or Chart.js
- **Auth (if needed):** InsForge Auth or NextAuth.js
- **Backend (if needed):** InsForge (database, real-time, serverless functions)

### Phase 3: Build The Dashboard
1. Set up a Next.js project
2. Create a simple API service layer (how to talk to the Xense API)
3. Build the sidebar/navigation
4. Build the main dashboard page with live data cards:
   - Battery % (big circular gauge)
   - Solar power (current + today's production)
   - Load power
   - Grid status indicator
   - Mode selector (Xense / Bypass / Auto)
   - Relay state (ON/OFF)
5. Build the history/charts page
6. Build the devices list page
7. Build settings/automation rules
8. Add notifications
9. Add authentication

### Phase 4: Test & Deploy
- [ ] Test with real API data
- [ ] Fix issues
- [ ] Deploy to Vercel (or InsForge hosting)
- [ ] Give the URL to the CEO/specialist

---

## Part 8: A Note On The Three Modes (Memorize These)

| Mode | What Happens | Who Decides |
|------|-------------|-------------|
| **Xense Mode** | Smart plug decides based on logic. If battery low → appliance OFF. If battery high → ON. | The Smart Plug (local) |
| **Bypass Mode** | Xense is disabled. Appliance always stays ON. Like a normal socket. | The User |
| **Auto Mode** | If Xense Mode is ON and grid power returns → automatically switch to grid power. | The Smart Plug (local) |

---

## Glossary (When The CEO Uses These Words)

| Term | Meaning |
|------|---------|
| **Transmitter / Dongle** | The box that connects to the inverter and reads data |
| **Receiver / Smart Plug** | The socket that controls power to appliances |
| **Relay** | The electronic switch inside the smart plug (ON = powered, OFF = cut) |
| **Load** | Any appliance plugged into the smart plug (AC, freezer, etc.) |
| **SOC** | State of Charge = battery percentage |
| **PV** | Photovoltaic = solar panels |
| **Bypass** | Disable smart logic, always keep power ON |
| **Xense Mode** | The core feature — logic-controlled power |
| **Auto Mode** | Switch to grid power when available |
| **PostgREST** | The engine InsForge uses to turn a PostgreSQL database into an API |
| **Anon Key** | A public key that lets the dashboard talk to InsForge without logging in |

---

## Summary: Your Role

You are the **frontend/software developer**. You are building the **web dashboard**.

- You are NOT building the hardware (already done)
- You are NOT building the cloud API (embedded specialist is doing that)
- You ARE building the visual interface that users will see in their browser

The dashboard is the **face of the product**. The CEO wants it to communicate "Xense is smart load control, not just monitoring" within 5 seconds of opening the page.

When you have the answers from the specialist, come back and we'll start building.

---

---

# Xense Energy — Architecture Overview

## The Big Picture

Xense Energy built a **hardware system** that controls when your appliances (AC, freezer, etc.) get power based on solar/battery conditions. Now they need a **web dashboard** to monitor and control everything remotely.

---

## The Hardware (Already Built)

```
┌──────────────────────┐          ┌──────────────────────────┐
│   ESP32 TRANSMITTER  │  WiFi    │   ESP32 SMART PLUG       │
│      (Dongle)        │ ──────→  │       (Receiver)         │
│                      │          │                          │
│  Connects to your    │          │  Has a RELAY (switch)    │
│  hybrid inverter     │          │  that turns power ON/OFF │
│                      │          │                          │
│  Reads parameters:   │          │  Contains the DECISION   │
│   - Battery %        │          │  ENGINE (the logic)      │
│   - Solar power      │          │                          │
│   - Grid status      │          │  E.g. "If battery < 35%  │
│   - Temperature      │          │  → open relay → turn OFF"│
│   - etc.             │          │                          │
└──────────────────────┘          └────────────┬─────────────┘
                                               │
                                               │ Sends data to cloud
                                               ▼
                                    ┌──────────────────────┐
                                    │    CLOUD API          │
                                    │  (Embedded specialist │
                                    │   is building this)   │
                                    │                      │
                                    │  Returns JSON data    │
                                    │  like:               │
                                    │  { "battery": 45,    │
                                    │    "solar": 1200,    │
                                    │    "mode": "xense" } │
                                    └──────────┬───────────┘
                                               │
                                               │ HTTP requests
                                               ▼
                                    ┌──────────────────────┐
                                    │   WEB DASHBOARD       │
                                    │   (We are building)   │
                                    │                      │
                                    │  Displays live data   │
                                    │  Charts & history     │
                                    │  Change modes         │
                                    │  Set automation rules │
                                    │  Get notifications    │
                                    └──────────────────────┘
```

---

## How It Works Step By Step

### 1. Data Collection
The **ESP32 Dongle** is physically wired to the hybrid inverter. It reads electrical parameters every few seconds.

### 2. Local Decision Making
The dongle sends this data over WiFi to the **Smart Plug (receiver)**. The smart plug has logic inside it that decides:
- "Is there enough battery/solar to keep the AC on?"
- If YES → relay stays closed → appliance stays ON
- If NO → relay opens → appliance turns OFF

This happens **locally** (no internet required) — so it works even if the cloud is down.

### 3. Cloud Upload
The smart plug also sends the data to a **Cloud API** (the embedded specialist is building this). This is what allows the dashboard to work.

### 4. Dashboard
Your **web dashboard** talks to the Cloud API to:
- Show live readings (battery %, solar power, etc.)
- Show history (charts for daily/weekly/monthly)
- Let users change the mode (Xense / Bypass / Automatic)
- Let users set rules ("IF battery > 80% THEN turn ON AC")
- Send notifications (battery low, grid restored, etc.)

---

## The 3 Modes

| Mode | What It Does |
|------|-------------|
| **Xense Mode** | Smart plug makes decisions. If battery/solar is enough → appliance stays ON. If not → power is cut. |
| **Bypass Mode** | Xense Mode is disabled. Appliance always stays ON (like a normal plug). |
| **Automatic Mode** | If Xense Mode is active and **grid power comes back**, it automatically switches to grid power. |

---

## What Data Will Be Displayed

- Battery Voltage & Percentage (%)
- PV (Solar) Voltage, Current, Power
- Load Power (what appliances are using)
- Grid Power & Grid Status (available or not)
- Battery Charging / Discharging status
- Battery Temperature & Inverter Temperature
- Frequency, AC Voltage
- Today's Solar Production & Consumption
- Relay State (ON or OFF)
- Current Mode (Xense / Bypass / Auto)
- Device Online status & WiFi Strength
- Firmware Version

---

## Questions We Still Need Answered

**From the embedded specialist (the API builder):**

1. **API URL** — Where is the API hosted?
2. **JSON structure** — What does the data look like? Can we see a sample?
3. **Authentication** — Do users need to log in? How?
4. **Update frequency** — How often does new data come? Every second? Every 5 seconds?
5. **Real-time or refresh?** — Do we use WebSocket (pushes data instantly) or HTTP (we ask for it)?
6. **Historical data** — Does the API store history? Can we get daily/weekly/monthly charts?
7. **Actions** — Can the dashboard change modes remotely? Is there an API endpoint for that?

---

## Next Step

Once we get those answers, we'll build the dashboard. The recommended stack based on your profile:

- **Framework:** Next.js (you already use it)
- **Styling:** Tailwind CSS
- **Charts:** Recharts or Chart.js
- **Backend (optional):** InsForge for auth, database, and real-time if needed
