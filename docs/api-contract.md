# Xense Energy — API Contract

> **For Hardware Engineer (ESP32)**
> This document defines the exact JSON format your ESP32 smart plug must send to the cloud API, and the endpoints the dashboard will use to read/write data.

---

## Base URL

```
https://kugpe8zm.us-east.insforge.app
```

**Auth Header (anon key):**
```
apikey: <your-insforge-anon-key>
Authorization: Bearer <your-insforge-anon-key>
```

> The dashboard and ESP32 both use the same anon key. RLS policies control who can read/write.

---

## Endpoint 1: Post Live Reading (ESP32 → Cloud)

**URL:** `POST /rest/v1/energy_readings`

**When:** Every 5 seconds (or every 1-2 seconds if hardware supports it)

**Headers:**
```
Content-Type: application/json
apikey: <anon-key>
Authorization: Bearer <anon-key>
Prefer: return=minimal
```

**Body:**
```json
{
  "device_id": "esp32-xs-001",
  "battery_percent": 72,
  "battery_voltage": 48.2,
  "battery_temperature": 35,
  "battery_charging": true,
  "battery_discharging": false,
  "pv_voltage": 120.5,
  "pv_current": 15.3,
  "pv_power": 1847,
  "load_power": 652,
  "grid_power": 0,
  "grid_status": "available",
  "frequency": 50.1,
  "ac_voltage": 230,
  "today_production": 4.2,
  "today_consumption": 2.1,
  "relay_state": "closed",
  "mode": "xense",
  "device_online": "online",
  "wifi_strength": -48,
  "firmware_version": "v2.1.3",
  "inverter_temperature": 38
}
```

**Response:** `201 Created` (empty body when `Prefer: return=minimal`)

---

## Field Definitions

| Field | Type | Unit | Example | Description |
|-------|------|------|---------|-------------|
| `device_id` | text | — | `"esp32-xs-001"` | Unique ID of the smart plug (ESP32 MAC or custom) |
| `timestamp` | timestamptz | — | auto | **Server-generated.** Do NOT send — PostgREST defaults to `now()` |
| `battery_percent` | numeric | % | `72` | Battery state of charge (0–100) |
| `battery_voltage` | numeric | V | `48.2` | Battery bank voltage |
| `battery_temperature` | numeric | °C | `35` | Battery temperature sensor |
| `battery_charging` | boolean | — | `true` | Is battery currently charging? |
| `battery_discharging` | boolean | — | `false` | Is battery currently discharging? |
| `pv_voltage` | numeric | V | `120.5` | Solar panel voltage |
| `pv_current` | numeric | A | `15.3` | Solar panel current |
| `pv_power` | numeric | W | `1847` | Solar panel power (V × A) |
| `load_power` | numeric | W | `652` | Total power consumed by appliances |
| `grid_power` | numeric | W | `0` | Power from/to grid (0 = off-grid) |
| `grid_status` | text | — | `"available"` | `"available"` or `"unavailable"` |
| `frequency` | numeric | Hz | `50.1` | AC output frequency |
| `ac_voltage` | numeric | V | `230` | AC output voltage |
| `today_production` | numeric | kWh | `4.2` | Total solar energy produced today |
| `today_consumption` | numeric | kWh | `2.1` | Total energy consumed today |
| `relay_state` | text | — | `"closed"` | `"closed"` = power ON, `"open"` = power OFF |
| `mode` | text | — | `"xense"` | `"xense"` / `"bypass"` / `"auto"` |
| `device_online` | text | — | `"online"` | `"online"` / `"offline"` / `"pending"` |
| `wifi_strength` | numeric | dBm | `-48` | WiFi signal strength (negative number, closer to 0 = stronger) |
| `firmware_version` | text | — | `"v2.1.3"` | Current firmware version on the ESP32 |
| `inverter_temperature` | numeric | °C | `38` | Inverter temperature sensor |

---

## Endpoint 2: Get Latest Reading (Dashboard ← Cloud)

**URL:** `GET /rest/v1/energy_readings?device_id=eq.esp32-xs-001&order=timestamp.desc&limit=1`

**Headers:**
```
apikey: <anon-key>
Authorization: Bearer <anon-key>
```

**Response:**
```json
[
  {
    "id": "a1b2c3d4-...",
    "device_id": "esp32-xs-001",
    "timestamp": "2026-07-17T18:30:00Z",
    "battery_percent": 72,
    "battery_voltage": 48.2,
    "pv_power": 1847,
    "load_power": 652,
    "relay_state": "closed",
    "mode": "xense",
    "...": "..."
  }
]
```

> Note: PostgREST returns an array. Take `[0]` for the latest reading.

---

## Endpoint 3: Get History (Dashboard ← Cloud)

**URL:** `GET /rest/v1/energy_readings?device_id=eq.esp32-xs-001&order=timestamp.desc&limit=100`

**For date range:**
```
GET /rest/v1/energy_readings?device_id=eq.esp32-xs-001&timestamp=gte.2026-07-17T00:00:00Z&timestamp=lte.2026-07-17T23:59:59Z&order=timestamp.asc
```

---

## Endpoint 4: Change Mode (Dashboard → Cloud → ESP32)

**URL:** `POST /rest/v1/rpc/set_device_mode`

**Body:**
```json
{
  "p_device_id": "esp32-xs-001",
  "p_mode": "bypass"
}
```

**Valid modes:** `"xense"` | `"bypass"` | `"auto"`

> This calls a PostgreSQL function. The function should update the `devices` table AND send a command to the ESP32 (via MQTT or direct WiFi if on same network).

---

## Endpoint 5: Control Relay (Dashboard → Cloud → ESP32)

**URL:** `POST /rest/v1/rpc/set_device_relay`

**Body:**
```json
{
  "p_device_id": "esp32-xs-001",
  "p_state": "open"
}
```

**Valid states:** `"closed"` (power ON) | `"open"` (power OFF)

---

## Endpoint 6: List Devices (Dashboard ← Cloud)

**URL:** `GET /rest/v1/devices`

**Response:**
```json
[
  {
    "id": "esp32-xs-001",
    "name": "XS-PLUG-001",
    "appliance": "Air Conditioner",
    "location": "Bedroom",
    "status": "online",
    "mode": "xense",
    "power": 1200,
    "signal": -52,
    "online": true,
    "relay_on": true
  }
]
```

---

## ESP32 POST Example (Arduino/C++)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* apiUrl = "https://kugpe8zm.us-east.database.insforge.app/rest/v1/energy_readings";
const char* apiKey = "YOUR_INSFORGE_ANON_KEY";

void sendReading() {
  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", apiKey);
  http.addHeader("Authorization", "Bearer " + String(apiKey));
  http.addHeader("Prefer", "return=minimal");

  String json = "{";
  json += "\"device_id\":\"" + deviceId + "\",";
  json += "\"battery_percent\":" + String(batteryPercent) + ",";
  json += "\"battery_voltage\":" + String(batteryVoltage) + ",";
  json += "\"pv_power\":" + String(pvPower) + ",";
  json += "\"load_power\":" + String(loadPower) + ",";
  json += "\"grid_status\":\"" + gridStatus + "\",";
  json += "\"relay_state\":\"" + relayState + "\",";
  json += "\"mode\":\"" + mode + "\",";
  json += "\"wifi_strength\":" + String(WiFi.RSSI()) + ",";
  json += "\"firmware_version\":\"" + firmwareVersion + "\"";
  json += "}";

  int httpCode = http.POST(json);
  http.end();
}
```

---

## Data Retention

The `energy_readings` table will accumulate data fast (one row every 5 seconds = ~17,280 rows/day/device). A scheduled function will delete records older than **7 days** to keep the database lean. Historical aggregates (daily/hourly totals) can be computed on-the-fly or stored in a summary table later.

---

## Quick Reference — All Endpoints

| Method | Endpoint | Purpose | Who Calls |
|--------|----------|---------|-----------|
| POST | `/rest/v1/energy_readings` | Send live reading | ESP32 (every 5s) |
| GET | `/rest/v1/energy_readings?...&limit=1` | Get latest reading | Dashboard |
| GET | `/rest/v1/energy_readings?...&limit=100` | Get history | Dashboard |
| GET | `/rest/v1/devices` | List all devices | Dashboard |
| POST | `/rest/v1/rpc/set_device_mode` | Change mode | Dashboard |
| POST | `/rest/v1/rpc/set_device_relay` | Toggle relay | Dashboard |
