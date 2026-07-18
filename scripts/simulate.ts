import { createClient } from '@insforge/sdk'
import { readFileSync } from 'fs'
import { resolve } from 'path'

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

const URL = process.env.NEXT_PUBLIC_INSFORGE_URL
const KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY
if (!URL || !KEY) {
  console.error('Missing NEXT_PUBLIC_INSFORGE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY in .env.local')
  process.exit(1)
}

const insforge = createClient({ baseUrl: URL, anonKey: KEY })

const intervalMs = parseInt(process.argv.find(a => a.startsWith('--interval='))?.split('=')[1] ?? '3000', 10)
const DEVICE_ID = 'esp32-xs-001'
const CYCLE_MS = 8 * 60 * 1000

let running = true
let tickCount = 0
let prodToday = 0
let consToday = 0
let startTime = Date.now()
let batterySoc = 50
let deviceDone = false

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

  const solarVoltage = 48 + n() * 4
  const solarCurr = solarVoltage > 0.1 ? solarPower / solarVoltage : 0
  const battVoltage = 51 + n() * 2
  const battCurr = battVoltage > 0.1 ? batteryPower / battVoltage : 0

  prodToday += solarPower * (intervalMs / 3600000)
  consToday += loadPower * (intervalMs / 3600000)

  return {
    device_id: DEVICE_ID,
    solar_voltage: +solarVoltage.toFixed(1),
    solar_current: +solarCurr.toFixed(2),
    solar_power: +solarPower.toFixed(1),
    battery_voltage: +battVoltage.toFixed(1),
    battery_current: +battCurr.toFixed(2),
    battery_power: +batteryPower.toFixed(1),
    battery_soc: +batterySoc.toFixed(1),
    load_power: +loadPower.toFixed(1),
    grid_power: +gridPower.toFixed(1),
    grid_available: gridAvail,
    energy_today: +prodToday.toFixed(3),
    timestamp: new Date().toISOString(),
  }
}

async function tick() {
  if (!running) return
  const reading = genReading()

  if (!deviceDone) {
    const { data: existing } = await insforge.database.from('devices').select('device_id').eq('device_id', DEVICE_ID)
    if (!existing?.length) {
      const { error: insertErr } = await insforge.database.from('devices').insert([{
        device_id: DEVICE_ID,
        name: 'Xense Solar Inverter',
        type: 'inverter',
        model: 'XS-3000',
        firmware_version: '2.1.0',
        location: 'Main Panel',
        status: 'online',
        last_seen: new Date().toISOString(),
      }])
      if (insertErr) console.error('[DEVICE INSERT ERROR]', insertErr)
    }
    deviceDone = true
  }

  const { error } = await insforge.database.from('energy_readings').insert([reading])
  if (error) {
    console.error('[INSERT ERROR]', error)
    return
  }

  tickCount++
  const hour = getHour()
  const timeStr = `${String(Math.floor(hour)).padStart(2, '0')}:${String(Math.floor((hour % 1) * 60)).padStart(2, '0')}`
  const gridStr = reading.grid_power >= 0
    ? `⬇ ${reading.grid_power.toFixed(0)}W grid`
    : `⬆ ${(-reading.grid_power).toFixed(0)}W export`
  console.log(`[${timeStr}]  solar ${reading.solar_power.toFixed(0)}W | batt ${reading.battery_soc}% | load ${reading.load_power.toFixed(0)}W | ${gridStr} | ${prodToday.toFixed(2)}kWh today`)
}

console.log('Xense Energy — Hardware Simulation')
console.log(`Device: ${DEVICE_ID} | Interval: ${intervalMs}ms | Sim day: ${(CYCLE_MS / 1000).toFixed(0)}s\n`)
setInterval(tick, intervalMs)
tick()
