// Xense Energy — Hardware Simulation
// Publishes realistic energy readings to MQTT broker.
// Bridge service picks them up and writes to Postgres.

import { readFileSync } from 'fs'
import { resolve } from 'path'
import mqtt from 'mqtt'

// ── Load .env.local ──
const envPath = resolve(process.cwd(), '.env.local')
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

// ── Config ──
const intervalMs = parseInt(process.argv.find(a => a.startsWith('--interval='))?.split('=')[1] ?? '3000', 10)
const DEVICE_ID = 'esp32-xs-001'
const CYCLE_MS = 8 * 60 * 1000

const MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtts://localhost:8883'
const MQTT_USER = process.env.MQTT_USERNAME || ''
const MQTT_PASS = process.env.MQTT_PASSWORD || ''

let running = true
let tickCount = 0
let prodToday = 0
let consToday = 0
let startTime = Date.now()
let batterySoc = 50

// ── MQTT Client ──
const mqttClient = mqtt.connect(MQTT_BROKER, {
  clientId: `sim-${DEVICE_ID}-${Math.random().toString(16).slice(2, 6)}`,
  username: MQTT_USER || undefined,
  password: MQTT_PASS || undefined,
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 10000,
})

process.on('SIGINT', () => {
  running = false
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`\nStopped. ${tickCount} readings in ${elapsed}s. Produced: ${prodToday.toFixed(2)}kWh`)
  mqttClient.end()
  process.exit(0)
})

function getHour(): number {
  return ((Date.now() - startTime) % CYCLE_MS) / CYCLE_MS * 24
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function genReading() {
  const hour = getHour()
  const n = () => (Math.random() - 0.5) * 2

  let solarPower = 0
  if (hour >= 6 && hour <= 18) {
    solarPower = Math.sin(Math.PI * (hour - 6) / 12) * 1200
    if (Math.random() < 0.15) solarPower *= (0.5 + Math.random() * 0.4)
  }
  solarPower = Math.max(0, solarPower + n() * 50)

  let loadPower = 200
  if (hour >= 7 && hour <= 9) loadPower = 450
  else if (hour >= 17 && hour <= 21) loadPower = 500
  else if (hour >= 22 || hour <= 5) loadPower = 120
  else loadPower = 250
  loadPower = Math.max(50, loadPower + n() * 60)

  const gridAvail = Math.random() > 0.02
  const surplus = solarPower - loadPower

  let batteryPower = 0
  if (surplus > 0) {
    batteryPower = surplus * 0.7
    batterySoc += (batteryPower / 5000) * 100
  } else {
    batteryPower = surplus * 0.4
    batterySoc += (batteryPower / 5000) * 100
  }
  batterySoc = clamp(batterySoc, 20, 95)

  let gridPower = 0
  if (gridAvail) {
    if (surplus > 0) {
      gridPower = -(surplus - (surplus * 0.7)) * 0.5
    } else {
      gridPower = -surplus * 0.5
    }
  }

  const pvVoltage = 48 + n() * 4
  const pvCurrent = pvVoltage > 0.1 ? solarPower / pvVoltage : 0
  const battVoltage = 51 + n() * 2
  const battTemp = 25 + n() * 5 + (batterySoc > 80 ? 5 : 0)
  const battCharging = batteryPower > 0
  const battDischarging = batteryPower < 0

  prodToday += solarPower * (intervalMs / 3600000)
  consToday += loadPower * (intervalMs / 3600000)

  return {
    device_id: DEVICE_ID,
    pv_voltage: +pvVoltage.toFixed(1),
    pv_current: +pvCurrent.toFixed(2),
    pv_power: +solarPower.toFixed(1),
    battery_percent: +batterySoc.toFixed(1),
    battery_voltage: +battVoltage.toFixed(1),
    battery_temperature: +battTemp.toFixed(1),
    battery_charging: battCharging,
    battery_discharging: battDischarging,
    load_power: +loadPower.toFixed(1),
    grid_power: +gridPower.toFixed(1),
    grid_status: gridAvail ? 'available' : 'unavailable',
    frequency: +(50 + n() * 0.2).toFixed(1),
    ac_voltage: +(230 + n() * 3).toFixed(1),
    today_production: +prodToday.toFixed(3),
    today_consumption: +consToday.toFixed(3),
    relay_state: 'closed',
    mode: 'auto',
    device_online: 'online',
    wifi_strength: Math.round(-55 + n() * 10),
    firmware_version: '2.1.0',
    inverter_temperature: Math.round(35 + n() * 8),
    timestamp: new Date().toISOString(),
  }
}

function tick() {
  if (!running) return
  const r = genReading()

  const topic = `xense/${DEVICE_ID}/telemetry`
  const payload = JSON.stringify(r)
  mqttClient.publish(topic, payload, { qos: 1 })

  tickCount++
  const hour = getHour()
  const timeStr = `${String(Math.floor(hour)).padStart(2, '0')}:${String(Math.floor((hour % 1) * 60)).padStart(2, '0')}`
  const gridStr = r.grid_power >= 0
    ? `⬇ ${r.grid_power.toFixed(0)}W grid`
    : `⬆ ${(-r.grid_power).toFixed(0)}W export`
  console.log(`[${timeStr}]  solar ${r.pv_power.toFixed(0)}W | batt ${r.battery_percent}% | load ${r.load_power.toFixed(0)}W | ${gridStr} | ${prodToday.toFixed(2)}kWh today`)
}

console.log('Xense Energy — Hardware Simulation (MQTT)')
console.log(`Device: ${DEVICE_ID} | Broker: ${MQTT_BROKER} | Interval: ${intervalMs}ms`)

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT broker — publishing simulated data...\n')
  tick()
  setInterval(tick, intervalMs)
})

mqttClient.on('error', (err) => {
  console.error('❌ MQTT error:', err.message)
  process.exit(1)
})
