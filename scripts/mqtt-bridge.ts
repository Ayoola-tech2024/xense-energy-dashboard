// Xense Energy — MQTT to InsForge Bridge
// Subscribes to ESP32 telemetry via MQTT, writes to PostgreSQL.
// Run: npx tsx scripts/mqtt-bridge.ts

import mqtt from 'mqtt'
import { Client } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── Load .env.local ──
const envPath = resolve(process.cwd(), '.env.local')
try {
  const envRaw = readFileSync(envPath, 'utf-8')
  for (const line of envRaw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1)
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* .env.local not found — use process.env */ }

// ── Config ──
const MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtts://localhost:8883'
const MQTT_USER = process.env.MQTT_USERNAME || ''
const MQTT_PASS = process.env.MQTT_PASSWORD || ''
const DATABASE_URL = process.env.DATABASE_URL || ''
const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'xense'

// ── Validate ──
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Add it to .env.local or environment.')
  process.exit(1)
}

// ── Postgres Client ──
const pg = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

// ── MQTT Client ──
const mqttOptions: mqtt.IClientOptions = {
  clientId: `bridge-${Math.random().toString(16).slice(2, 8)}`,
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 10000,
}
if (MQTT_USER) mqttOptions.username = MQTT_USER
if (MQTT_PASS) mqttOptions.password = MQTT_PASS
// TLS is auto-negotiated when using mqtts:// protocol

const mqttClient = mqtt.connect(MQTT_BROKER, mqttOptions)

// ── Stats ──
let messageCount = 0
let errorCount = 0
const startTime = Date.now()

// ── Graceful shutdown ──
process.on('SIGINT', async () => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`\n🛑 Stopped. ${messageCount} messages in ${elapsed}s (${errorCount} errors)`)
  mqttClient.end()
  await pg.end()
  process.exit(0)
})

// ── Insert reading ──
async function insertReading(data: Record<string, unknown>) {
  const fields = [
    'device_id', 'pv_voltage', 'pv_current', 'pv_power',
    'battery_percent', 'battery_voltage', 'battery_temperature',
    'battery_charging', 'battery_discharging',
    'load_power', 'grid_power', 'grid_status',
    'frequency', 'ac_voltage',
    'today_production', 'today_consumption',
    'relay_state', 'mode', 'device_online',
    'wifi_strength', 'firmware_version', 'inverter_temperature',
  ]

  const values = fields.map(f => {
    const v = data[f]
    if (v === undefined || v === null) return null
    if (typeof v === 'boolean') return v
    if (typeof v === 'number') return v
    return String(v)
  })

  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ')
  const sql = `INSERT INTO energy_readings (${fields.join(', ')}) VALUES (${placeholders})`

  await pg.query(sql, values)
}

// ── Connect handlers ──
pg.connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL')

    mqttClient.on('connect', () => {
      console.log(`✅ Connected to MQTT broker: ${MQTT_BROKER}`)
      const topic = `${TOPIC_PREFIX}/+/telemetry`
      mqttClient.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error('❌ Subscribe error:', err.message)
        } else {
          console.log(`✅ Subscribed to: ${topic}`)
          console.log('🔄 Waiting for ESP32 messages...\n')
        }
      })
    })

    mqttClient.on('message', async (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString())
        await insertReading(data)
        messageCount++

        const time = new Date().toLocaleTimeString()
        const solar = Number(data.pv_power) || 0
        const batt = Number(data.battery_percent) || 0
        const load = Number(data.load_power) || 0
        const deviceId = data.device_id || 'unknown'
        console.log(`[${time}] ✅ ${deviceId}: solar=${solar}W batt=${batt}% load=${load}W`)
      } catch (err: any) {
        errorCount++
        console.error(`❌ Error processing message:`, err.message?.slice(0, 100))
      }
    })

    mqttClient.on('error', (err) => {
      console.error('❌ MQTT error:', err.message)
    })

    mqttClient.on('offline', () => {
      console.log('⚠️  MQTT disconnected, reconnecting...')
    })

    mqttClient.on('reconnect', () => {
      console.log('🔄 MQTT reconnecting...')
    })
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message)
    process.exit(1)
  })
