// ─── API Service Layer ───
// Live data + devices from InsForge. Decisions, rules, notifications = mock (no DB tables yet).

import { insforge } from "./insforge";
import { mockDashboardData } from "./mock-data";
import type {
  DashboardData,
  LiveData,
  Device,
  AiDecision,
  AutomationRule,
  NotificationItem,
  Mode,
  ChartData,
  EnergyTotals,
} from "./types";

// ─── Live Data ───

export async function fetchLiveData(deviceId: string = "esp32-xs-001"): Promise<LiveData> {
  const { data, error } = await insforge.database
    .from("energy_readings")
    .select("*")
    .eq("device_id", deviceId)
    .order("timestamp", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    console.warn("[API] Falling back to mock live data:", error?.message);
    return mockDashboardData.live;
  }

  const row = data[0];
  return {
    device_id: row.device_id,
    timestamp: row.timestamp,
    battery_percent: Number(row.battery_percent) ?? 0,
    battery_voltage: Number(row.battery_voltage) ?? 0,
    battery_temperature: Number(row.battery_temperature) ?? 0,
    battery_charging: Boolean(row.battery_charging),
    battery_discharging: Boolean(row.battery_discharging),
    pv_voltage: Number(row.pv_voltage) ?? 0,
    pv_current: Number(row.pv_current) ?? 0,
    pv_power: Number(row.pv_power) ?? 0,
    load_power: Number(row.load_power) ?? 0,
    grid_power: Number(row.grid_power) ?? 0,
    grid_status: (row.grid_status as LiveData["grid_status"]) ?? "unavailable",
    frequency: Number(row.frequency) ?? 0,
    ac_voltage: Number(row.ac_voltage) ?? 0,
    today_production: Number(row.today_production) ?? 0,
    today_consumption: Number(row.today_consumption) ?? 0,
    relay_state: (row.relay_state as LiveData["relay_state"]) ?? "open",
    mode: (row.mode as LiveData["mode"]) ?? "xense",
    device_online: (row.device_online as LiveData["device_online"]) ?? "offline",
    wifi_strength: Number(row.wifi_strength) ?? 0,
    firmware_version: row.firmware_version ?? "",
    inverter_temperature: Number(row.inverter_temperature) ?? 0,
  };
}

// ─── Devices ───

export async function fetchDevices(): Promise<Device[]> {
  const { data, error } = await insforge.database
    .from("devices")
    .select("*")
    .order("name");

  if (error || !data) {
    console.warn("[API] Falling back to mock devices:", error?.message);
    return mockDashboardData.devices;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    appliance: row.appliance ?? "",
    location: row.location ?? "",
    status: (row.status as Device["status"]) ?? "offline",
    mode: (row.mode as Device["mode"]) ?? "xense",
    power: Number(row.power) ?? 0,
    signal: Number(row.signal) ?? 0,
    online: Boolean(row.online),
    relay_on: Boolean(row.relay_on),
  }));
}

// ─── Chart Data (derived from recent readings) ───

export async function fetchChartData(deviceId: string = "esp32-xs-001"): Promise<ChartData[]> {
  const { data, error } = await insforge.database
    .from("energy_readings")
    .select("timestamp, pv_power, load_power")
    .eq("device_id", deviceId)
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    return mockDashboardData.chartData;
  }

  // Group by hour and average
  const byHour = new Map<string, { prod: number[]; cons: number[] }>();
  for (const row of data) {
    const hour = new Date(row.timestamp).toTimeString().slice(0, 5);
    const existing = byHour.get(hour) ?? { prod: [], cons: [] };
    existing.prod.push(Number(row.pv_power) / 1000);
    existing.cons.push(Number(row.load_power) / 1000);
    byHour.set(hour, existing);
  }

  return Array.from(byHour.entries())
    .map(([time, { prod, cons }]) => ({
      time,
      production: Math.round((prod.reduce((a, b) => a + b, 0) / prod.length) * 10) / 10,
      consumption: Math.round((cons.reduce((a, b) => a + b, 0) / cons.length) * 10) / 10,
    }))
    .reverse();
}

// ─── Energy Totals (derived from today's readings) ───

export async function fetchEnergyTotals(deviceId: string = "esp32-xs-001"): Promise<EnergyTotals> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await insforge.database
    .from("energy_readings")
    .select("pv_power, load_power")
    .eq("device_id", deviceId)
    .gte("timestamp", today.toISOString())
    .order("timestamp", { ascending: false });

  if (error || !data || data.length === 0) {
    return mockDashboardData.totals;
  }

  const totalProd = data.reduce((sum, r) => sum + (Number(r.pv_power) || 0), 0) / 1000;
  const totalCons = data.reduce((sum, r) => sum + (Number(r.load_power) || 0), 0) / 1000;
  const saved = Math.max(0, totalProd - totalCons);

  return {
    total_production: Math.round(totalProd * 10) / 10,
    total_consumption: Math.round(totalCons * 10) / 10,
    energy_saved: Math.round(saved * 10) / 10,
    co2_avoided: Math.round(saved * 2.45),
    savings_percent: totalProd > 0 ? Math.round((saved / totalProd) * 100) : 0,
  };
}

// ─── Mock-only data (no DB tables yet) ───

export async function fetchDecisions(): Promise<AiDecision[]> {
  return mockDashboardData.decisions;
}

export async function fetchRules(): Promise<AutomationRule[]> {
  return mockDashboardData.rules;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  return mockDashboardData.notifications;
}

// ─── Combined dashboard fetch ───

export async function fetchDashboardData(): Promise<DashboardData> {
  const [live, devices, chartData, totals, decisions, rules, notifications, priorities] =
    await Promise.all([
      fetchLiveData(),
      fetchDevices(),
      fetchChartData(),
      fetchEnergyTotals(),
      fetchDecisions(),
      fetchRules(),
      fetchNotifications(),
      Promise.resolve(mockDashboardData.priorities),
    ]);

  return { live, devices, chartData, totals, decisions, rules, notifications, priorities };
}

// ─── RPC Actions ───

export async function setMode(deviceId: string, mode: Mode): Promise<void> {
  const { error } = await insforge.database.rpc("set_device_mode", {
    p_device_id: deviceId,
    p_mode: mode,
  });
  if (error) {
    console.error("[API] setMode failed:", error);
    throw new Error(error.message);
  }
}

export async function setRelay(
  deviceId: string,
  state: "on" | "off"
): Promise<void> {
  const { error } = await insforge.database.rpc("set_device_relay", {
    p_device_id: deviceId,
    p_state: state === "on" ? "closed" : "open",
  });
  if (error) {
    console.error("[API] setRelay failed:", error);
    throw new Error(error.message);
  }
}
