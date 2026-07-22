// Xense Energy — Hardware Simulation
// Posts realistic energy readings to InsForge via CLI.

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

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

let running = true
let tickCount = 0
let prodToday = 0
let consToday = 0
let startTime = Date.now()
let batterySoc = 50

process.on('SIGINT', () => {
  running = false
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`\nStopped. ${tickCount} readings in ${elapsed}s. Produced: ${prodToday.toFixed(2)}kWh`)
  process.exit(0)
})

function getHour(): number {
  return ((Date.now() - startTime) % CYCLE_MS) / CYCLE_MS * 24
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function esc(v: string | number | boolean | null): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') return String(v)
  return `'${String(v).replace(/'/g, "''")}'`
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

  const vals = [
    esc(r.device_id), esc(r.pv_voltage), esc(r.pv_current), esc(r.pv_power),
    esc(r.battery_percent), esc(r.battery_voltage), esc(r.battery_temperature),
    esc(r.battery_charging), esc(r.battery_discharging),
    esc(r.load_power), esc(r.grid_power), esc(r.grid_status),
    esc(r.frequency), esc(r.ac_voltage),
    esc(r.today_production), esc(r.today_consumption),
    esc(r.relay_state), esc(r.mode), esc(r.device_online),
    esc(r.wifi_strength), esc(r.firmware_version), esc(r.inverter_temperature),
    esc(r.timestamp),
  ].join(', ')

  const sql = `INSERT INTO energy_readings (device_id, pv_voltage, pv_current, pv_power, battery_percent, battery_voltage, battery_temperature, battery_charging, battery_discharging, load_power, grid_power, grid_status, frequency, ac_voltage, today_production, today_consumption, relay_state, mode, device_online, wifi_strength, firmware_version, inverter_temperature, timestamp) VALUES (${vals})`

  try {
    execSync(`npx @insforge/cli db query "${sql.replace(/"/g, '\\"')}" --json`, {
      stdio: 'pipe',
      timeout: 10000,
    })
  } catch (e: any) {
    console.error('[INSERT ERROR]', e.stderr?.toString()?.slice(0, 200) || e.message?.slice(0, 200))
    return
  }

  tickCount++
  const hour = getHour()
  const timeStr = `${String(Math.floor(hour)).padStart(2, '0')}:${String(Math.floor((hour % 1) * 60)).padStart(2, '0')}`
  const gridStr = r.grid_power >= 0
    ? `⬇ ${r.grid_power.toFixed(0)}W grid`
    : `⬆ ${(-r.grid_power).toFixed(0)}W export`
  console.log(`[${timeStr}]  solar ${r.pv_power.toFixed(0)}W | batt ${r.battery_percent}% | load ${r.load_power.toFixed(0)}W | ${gridStr} | ${prodToday.toFixed(2)}kWh today`)
}

console.log('Xense Energy — Hardware Simulation')
console.log(`Device: ${DEVICE_ID} | Interval: ${intervalMs}ms | Sim day: ${(CYCLE_MS / 1000).toFixed(0)}s\n`)
setInterval(tick, intervalMs)
tick()
