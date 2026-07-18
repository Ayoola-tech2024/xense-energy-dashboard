# Xense Technical Brief — Extracted Content

*Source: XENSE TECHNICAL BRIEF.pdf (8 pages)*

---

## Modes

### Xense Mode
Our MVP feature. The WiFi dongle (transmitter) collects solar parameters from a Hybrid Inverter setup and transmits the parameters to a smart plug (receiver) where all the logic is done. If the logic meets a certain condition, the circuit opens or closes. If the circuit closes, appliances plugged onto the smart plug remain powered. If the condition is not met, the smart plug opens the circuit and no power is allowed to power any appliances like Air conditioners/freezers.

### Bypass Mode
Bypass mode disables the Xense mode.

### Automatic Mode
In this mode, if the device is set on Xense mode and another source of power from the grid comes, it would automatically bypass the power from the inverter and supply the appliances connected to the Smart plug (receiver).

---

## Core Philosophy

> "Our MVP is not another solar monitoring platform. The monitoring is simply an enabler. Our innovation is solar-intelligent load control."

> "Xense doesn't just monitor energy. Xense intelligently decides how energy should be used."

> That difference needs to be obvious within 5 seconds of opening the dashboard.

---

## Hardware Architecture

- **ESP32 Wi-Fi Transmitter (Dongle)** connects to the hybrid inverter and reads parameters
- It sends those parameters over Wi-Fi
- **ESP32 Smart Plug (Receiver)** receives the data
- The receiver contains the decision engine (logic)
- Based on your algorithm, it either:
  - Closes the relay → appliance stays ON
  - Opens the relay → appliance turns OFF

### Cloud Dashboard Purpose
- Monitoring
- Configuration
- User control
- Analytics
- Device management

---

## Data Points (What reaches the dashboard)

| Parameter | Description |
|-----------|-------------|
| Battery Voltage | Voltage of the battery bank |
| Battery % | State of charge percentage |
| PV Voltage | Solar panel voltage |
| PV Current | Solar panel current |
| PV Power | Solar panel power (watts) |
| Load Power | Power being consumed |
| Grid Power | Power from/to grid |
| Grid Status | Grid available or not |
| Battery Charging | Charging status |
| Battery Discharging | Discharging status |
| Battery Temperature | Battery temperature |
| Inverter Temperature | Inverter temperature |
| Frequency | AC frequency |
| AC Voltage | AC output voltage |
| Today's Solar Production | Total solar generated today |
| Today's Consumption | Total consumed today |
| Relay State | ON or OFF |
| Current Mode | Xense / Bypass / Auto |
| Device Online | Connected or offline |
| WiFi Strength | Signal strength |
| Firmware Version | Device firmware |

---

## Frontend Questions to Answer

### Data & Updates
- What does the backend actually send?
- How often is data updated? (Every 1s, 5s, 30s, or only when values change?)
- What historical data is stored?
- Can we show Daily / Weekly / Monthly / Yearly graphs? Or only live data?

### Xense Mode UX
- How do we know Xense Mode is active? What icon?
- Can users enable it remotely?
- Can users schedule it?
- Can users lock it?
- Can the dashboard explain WHY an appliance was disconnected?

Example card:
```
Air Conditioner
Status: OFF
Reason: Battery below 35%
Decision: Xense Logic disconnected load
Time: 2:42 PM
```

### Automatic Mode UX
- Exactly what event triggers automatic bypass?
  - Grid voltage detected?
  - Battery below threshold?
  - Battery SOC?
  - Solar unavailable?
  - User settings?

Example display:
```
Mode: Automatic
Reason: Grid restored
Action: Loads moved to Grid
Time: 2:17 PM
```

### AI Decision Card
- Keep AC ON — Reason: Battery 96%, Solar Production High — Confidence: Optimal
- Air Conditioner — Running — Reason: Solar surplus
- Freezer — Running — Reason: Battery healthy
- Water Heater — OFF — Reason: Insufficient solar

### Priority List
1. Refrigerator
2. Lighting
3. Television
4. Air Conditioner
5. Water Heater

### Automation Rules (Examples)
```
IF Battery > 80% AND Solar > 2000W THEN Turn ON AC
IF Battery < 35% THEN Turn OFF Freezer
```

---

## Requirements Checklist

### Live Data
- What data comes every second?
- Units of measurement?
- Precision?
- Refresh interval?

### Modes
- How is Xense Mode enabled?
- How is Bypass enabled?
- How is Automatic Mode triggered?
- Can users switch remotely?
- What permissions are required?

### Notifications
- Battery Low
- Grid Restored
- Grid Lost
- Solar Available
- Mode Change
- Temperature Alert
- Overload status
- Device Offline

### Reports
- Daily solar
- Daily consumption
- Energy saved
- Runtime
- Monthly savings

### Backend / API
- API format?
- Authentication?
- WebSocket or HTTP?
- JSON structure?
- Error codes?
