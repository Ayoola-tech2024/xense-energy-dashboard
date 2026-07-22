# Xense Energy — API Contract (MQTT)

> **For Hardware Engineer (ESP32) + Dashboard Team**
> This document defines the exact JSON format the ESP32 must publish via MQTT, the topic structure, and how data flows from hardware to dashboard.

---

## Complete Data Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   ESP32     │ ───▶ │  HiveMQ      │ ───▶ │  Bridge     │ ───▶ │  Database    │ ───▶ │  Dashboard  │
│  (you)      │ MQTT │  (cloud)     │ MQTT │  (Render)   │ SQL  │  (InsForge)  │ GET  │  (Vercel)   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘      └─────────────┘
    Every 5s              Receives             Saves to DB         Stores data          Shows live data
    publishes JSON        your message         your message        forever              + charts
```

### Step-by-Step Flow

**Step 1: ESP32 reads sensors**
- Your ESP32 reads: battery %, solar voltage/current/power, load power, grid status, temperature, etc.
- You build a JSON object with all 21 fields

**Step 2: ESP32 publishes to MQTT**
- ESP32 connects to HiveMQ broker (`a480ae87e6974650ba20764b3db2d7a9.s1.eu.hivemq.cloud:8883`)
- Every 5 seconds, publishes JSON to topic `xense/esp32-xs-001/telemetry`
- Example message:
```json
{
  "device_id": "esp32-xs-001",
  "battery_percent": 72,
  "pv_power": 1847,
  "load_power": 652,
  "grid_status": "available",
  ...
}
```

**Step 3: HiveMQ receives the message**
- HiveMQ is a cloud message broker (like a post office)
- It receives your JSON and holds it until someone picks it up
- You don't need to do anything here — it just works

**Step 4: Bridge picks up the message**
- Our bridge service (`https://xense-mqtt-bridge.onrender.com`) runs 24/7
- It subscribes to `xense/+/telemetry` (any device)
- When your message arrives, it reads the JSON

**Step 5: Bridge saves to database**
- Bridge takes your JSON and inserts it into the `energy_readings` table in PostgreSQL
- Every reading is stored with a timestamp
- The database keeps the last 7 days of data (auto-deletes older data)

**Step 6: Dashboard reads from database**
- Dashboard (`https://xense-energy-dashboard.vercel.app`) queries the database every 5 seconds
- It asks: "Give me the latest reading for device esp32-xs-001"
- Database returns your JSON

**Step 7: Dashboard displays the data**
- Live numbers update (battery %, solar power, load, etc.)
- Charts show last 24 hours of production vs consumption
- Device list shows online/offline status
- Energy totals show today's production and savings

---

## What Each Service Does

| Service | URL | What It Does | Who Runs It |
|---------|-----|-------------|-------------|
| **ESP32** | — | Reads sensors, publishes JSON every 5s | Hardware engineer |
| **HiveMQ** | `a480ae87e6974650ba20764b3db2d7a9.s1.eu.hivemq.cloud` | Cloud mailbox — receives and holds messages | HiveMQ Cloud (free) |
| **Bridge** | `https://xense-mqtt-bridge.onrender.com` | Picks up messages, saves to database | You (auto-deploys) |
| **Database** | InsForge PostgreSQL | Stores all readings (7 days history) | InsForge (auto) |
| **Dashboard** | `https://xense-energy-dashboard.vercel.app` | Shows live data, charts, device list | You (auto-deploys) |

---

## MQTT Broker Connection

| Setting | Value |
|---------|-------|
| **Broker** | HiveMQ Cloud |
| **Host** | `a480ae87e6974650ba20764b3db2d7a9.s1.eu.hivemq.cloud` |
| **Port** | 8883 (TLS) |
| **Username** | `esp32-xs-001` |
| **Password** | `Xense2026` |
| **Client ID** | `esp32-xs-001` |

> Use these exact values in your ESP32 code.

---

## MQTT Topics

| Topic | Direction | QoS | Description |
|-------|-----------|-----|-------------|
| `xense/esp32-xs-001/telemetry` | ESP32 → Broker | 1 | Main sensor data (publish every 5s) |
| `xense/esp32-xs-001/status` | ESP32 → Broker | 1 | Online/offline status |

**Topic naming:** `xense/{device_id}/telemetry` — replace `esp32-xs-001` with your device ID.

---

## Telemetry Payload

Publish this JSON to `xense/esp32-xs-001/telemetry` every 5 seconds:

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

---

## Field Definitions

| Field | Type | Unit | Example | Description |
|-------|------|------|---------|-------------|
| `device_id` | string | — | `"esp32-xs-001"` | Unique ID of the ESP32 device |
| `battery_percent` | number | % | `72` | Battery state of charge (0–100) |
| `battery_voltage` | number | V | `48.2` | Battery bank voltage |
| `battery_temperature` | number | °C | `35` | Battery temperature sensor |
| `battery_charging` | boolean | — | `true` | Is battery currently charging? |
| `battery_discharging` | boolean | — | `false` | Is battery currently discharging? |
| `pv_voltage` | number | V | `120.5` | Solar panel voltage |
| `pv_current` | number | A | `15.3` | Solar panel current |
| `pv_power` | number | W | `1847` | Solar panel power (V × A) |
| `load_power` | number | W | `652` | Total power consumed by appliances |
| `grid_power` | number | W | `0` | Power from/to grid (0 = off-grid) |
| `grid_status` | string | — | `"available"` | `"available"` or `"unavailable"` |
| `frequency` | number | Hz | `50.1` | AC output frequency |
| `ac_voltage` | number | V | `230` | AC output voltage |
| `today_production` | number | kWh | `4.2` | Total solar energy produced today |
| `today_consumption` | number | kWh | `2.1` | Total energy consumed today |
| `relay_state` | string | — | `"closed"` | `"closed"` = power ON, `"open"` = power OFF |
| `mode` | string | — | `"xense"` | `"xense"` / `"bypass"` / `"auto"` |
| `device_online` | string | — | `"online"` | `"online"` / `"offline"` |
| `wifi_strength` | number | dBm | `-48` | WiFi signal (closer to 0 = stronger) |
| `firmware_version` | string | — | `"v2.1.3"` | Current firmware version |
| `inverter_temperature` | number | °C | `38` | Inverter temperature sensor |

> **Note:** All fields are required. The dashboard stores every reading for history and charts.

---

## Status Payload

Publish this to `xense/esp32-xs-001/status` when connection state changes:

```json
{
  "online": true,
  "rssi": -48,
  "firmware": "v2.1.3"
}
```

---

## C++ Example Code (Arduino/ESP32)

Uses the `PubSubClient` library. Install via Arduino Library Manager.

**Important:** HiveMQ Cloud requires TLS (port 8883). You need `WiFiClientSecure` for the connection.

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

// ── WiFi Config ──
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ── MQTT Config ──
const char* mqttServer = "a480ae87e6974650ba20764b3db2d7a9.s1.eu.hivemq.cloud";
const int mqttPort = 8883;
const char* mqttUser = "esp32-xs-001";
const char* mqttPass = "Xense2026";
const char* deviceId = "esp32-xs-001";

// ── Topics ──
String telemetryTopic = "xense/" + String(deviceId) + "/telemetry";
String statusTopic = "xense/" + String(deviceId) + "/status";

// ── Objects ──
WiFiClientSecure secureClient;
PubSubClient mqtt(secureClient);
unsigned long lastPublish = 0;
const long publishInterval = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  
  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  
  // TLS: Skip certificate verification (for testing only)
  secureClient.setInsecure();
  
  // Connect MQTT
  mqtt.setServer(mqttServer, mqttPort);
  reconnect();
}

void loop() {
  if (!mqtt.connected()) {
    reconnect();
  }
  mqtt.loop();
  
  // Publish every 5 seconds
  if (millis() - lastPublish >= publishInterval) {
    publishTelemetry();
    lastPublish = millis();
  }
}

void reconnect() {
  while (!mqtt.connected()) {
    Serial.print("Connecting MQTT...");
    if (mqtt.connect(deviceId, mqttUser, mqttPass)) {
      Serial.println("connected");
      // Publish online status
      mqtt.publish(statusTopic.c_str(), "{\"online\":true,\"rssi\":" + String(WiFi.RSSI()) + "}", true);
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" retrying in 5s");
      delay(5000);
    }
  }
}

void publishTelemetry() {
  // ── Read your sensors here ──
  float batteryPercent = 72.0;
  float batteryVoltage = 48.2;
  float batteryTemp = 35.0;
  bool batteryCharging = true;
  bool batteryDischarging = false;
  float pvVoltage = 120.5;
  float pvCurrent = 15.3;
  float pvPower = 1847.0;
  float loadPower = 652.0;
  float gridPower = 0.0;
  String gridStatus = "available";
  float frequency = 50.1;
  float acVoltage = 230.0;
  float todayProduction = 4.2;
  float todayConsumption = 2.1;
  String relayState = "closed";
  String mode = "xense";
  float inverterTemp = 38.0;
  
  // ── Build JSON ──
  String json = "{";
  json += "\"device_id\":\"" + String(deviceId) + "\",";
  json += "\"battery_percent\":" + String(batteryPercent, 1) + ",";
  json += "\"battery_voltage\":" + String(batteryVoltage, 1) + ",";
  json += "\"battery_temperature\":" + String(batteryTemp, 1) + ",";
  json += "\"battery_charging\":" + String(batteryCharging ? "true" : "false") + ",";
  json += "\"battery_discharging\":" + String(batteryDischarging ? "true" : "false") + ",";
  json += "\"pv_voltage\":" + String(pvVoltage, 1) + ",";
  json += "\"pv_current\":" + String(pvCurrent, 2) + ",";
  json += "\"pv_power\":" + String(pvPower, 1) + ",";
  json += "\"load_power\":" + String(loadPower, 1) + ",";
  json += "\"grid_power\":" + String(gridPower, 1) + ",";
  json += "\"grid_status\":\"" + gridStatus + "\",";
  json += "\"frequency\":" + String(frequency, 1) + ",";
  json += "\"ac_voltage\":" + String(acVoltage, 1) + ",";
  json += "\"today_production\":" + String(todayProduction, 3) + ",";
  json += "\"today_consumption\":" + String(todayConsumption, 3) + ",";
  json += "\"relay_state\":\"" + relayState + "\",";
  json += "\"mode\":\"" + mode + "\",";
  json += "\"device_online\":\"online\",";
  json += "\"wifi_strength\":" + String(WiFi.RSSI()) + ",";
  json += "\"firmware_version\":\"v2.1.3\",";
  json += "\"inverter_temperature\":" + String(inverterTemp);
  json += "}";
  
  // ── Publish ──
  if (mqtt.publish(telemetryTopic.c_str(), json.c_str())) {
    Serial.println("Published: " + json.substring(0, 60) + "...");
  } else {
    Serial.println("Publish failed!");
  }
}
```

---

## What the Dashboard Shows

Once your ESP32 starts publishing, the dashboard automatically shows:

| Dashboard Page | What It Shows |
|---------------|---------------|
| **Overview** | Live battery %, solar power, load power, grid status, today's production |
| **Analytics** | Charts of production vs consumption over last 24 hours |
| **Devices** | List of all smart plugs with online/offline status, current mode |
| **Energy Totals** | Today's total production, consumption, savings, CO2 avoided |

---

## v1 Limitations

In this version, the ESP32 is **read-only** from the dashboard perspective:
- The dashboard can VIEW all sensor data
- The dashboard CANNOT change mode (xense/bypass/auto) remotely
- The dashboard CANNOT toggle relay ON/OFF remotely
- The dashboard CANNOT send commands to the ESP32

These features will be added in a future version via MQTT command topics.

---

## Quick Reference

| Item | Value |
|------|-------|
| **Broker** | HiveMQ Cloud |
| **Port** | 8883 (TLS) |
| **Publish topic** | `xense/{device_id}/telemetry` |
| **Status topic** | `xense/{device_id}/status` |
| **QoS** | 1 (at least once) |
| **Interval** | Every 5 seconds |
| **Payload** | JSON (21 fields, all required) |
| **Retained** | No (latest data via database) |
| **Dashboard** | `https://xense-energy-dashboard.vercel.app` |
| **Bridge** | `https://xense-mqtt-bridge.onrender.com` |
