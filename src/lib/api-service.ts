// ─── API Service Layer ───
// All data from InsForge. Mock fallbacks only if API fails.

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
    battery_percent: Number(row.battery_percent) || 0,
    battery_voltage: Number(row.battery_voltage) || 0,
    battery_temperature: Number(row.battery_temperature) || 0,
    battery_charging: Boolean(row.battery_charging),
    battery_discharging: Boolean(row.battery_discharging),
    pv_voltage: Number(row.pv_voltage) || 0,
    pv_current: Number(row.pv_current) || 0,
    pv_power: Number(row.pv_power) || 0,
    load_power: Number(row.load_power) || 0,
    grid_power: Number(row.grid_power) || 0,
    grid_status: row.grid_status || "unavailable",
    frequency: Number(row.frequency) || 50,
    ac_voltage: Number(row.ac_voltage) || 230,
    today_production: Number(row.today_production) || 0,
    today_consumption: Number(row.today_consumption) || 0,
    relay_state: (row.relay_state as LiveData["relay_state"]) ?? "closed",
    mode: (row.mode as LiveData["mode"]) ?? "auto",
    device_online: row.device_online || "online",
    wifi_strength: Number(row.wifi_strength) || -60,
    firmware_version: row.firmware_version || "2.1.0",
    inverter_temperature: Number(row.inverter_temperature) || 0,
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

// ─── Chart Data (from hourly summary) ───

export async function fetchChartData(deviceId: string = "esp32-xs-001"): Promise<ChartData[]> {
  const { data, error } = await insforge.database
    .from("hourly_energy_summary")
    .select("hour_start, avg_pv_power, avg_load_power")
    .eq("device_id", deviceId)
    .order("hour_start", { ascending: false })
    .limit(24);

  if (error || !data || data.length === 0) {
    return mockDashboardData.chartData;
  }

  return data
    .map((row) => ({
      time: new Date(row.hour_start).toTimeString().slice(0, 5),
      production: Math.round((Number(row.avg_pv_power) / 1000) * 10) / 10,
      consumption: Math.round((Number(row.avg_load_power) / 1000) * 10) / 10,
    }))
    .reverse();
}

// ─── Energy Totals (from daily summary) ───

export async function fetchEnergyTotals(deviceId: string = "esp32-xs-001"): Promise<EnergyTotals> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await insforge.database
    .from("daily_energy_summary")
    .select("total_pv_kwh, total_load_kwh")
    .eq("device_id", deviceId)
    .eq("day_date", today);

  if (error || !data || data.length === 0) {
    return mockDashboardData.totals;
  }

  const row = data[0];
  const totalProd = Number(row.total_pv_kwh) || 0;
  const totalCons = Number(row.total_load_kwh) || 0;
  const saved = Math.max(0, totalProd - totalCons);

  return {
    total_production: Math.round(totalProd * 10) / 10,
    total_consumption: Math.round(totalCons * 10) / 10,
    energy_saved: Math.round(saved * 10) / 10,
    co2_avoided: Math.round(saved * 2.45),
    savings_percent: totalProd > 0 ? Math.round((saved / totalProd) * 100) : 0,
  };
}

// ─── Decisions (from DB) ───

export async function fetchDecisions(): Promise<AiDecision[]> {
  const { data, error } = await insforge.database
    .from("ai_decisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) {
    console.warn("[API] Falling back to mock decisions:", error?.message);
    return mockDashboardData.decisions;
  }

  return data.map((row) => ({
    id: row.id,
    appliance: row.appliance,
    icon: row.icon ?? "bolt",
    status: row.status as AiDecision["status"],
    reason: row.reason ?? "",
    time: new Date(row.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    load: Number(row.load_watts) ?? 0,
    confidence: row.confidence ?? "Pending",
    duration: row.duration ?? undefined,
    priority: Number(row.priority) ?? 0,
  }));
}

// ─── Rules (from DB) ───

export async function fetchRules(): Promise<AutomationRule[]> {
  const { data, error } = await insforge.database
    .from("automation_rules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[API] Falling back to mock rules:", error?.message);
    return mockDashboardData.rules;
  }

  return data.map((row) => ({
    id: row.id,
    condition: row.condition_text,
    action: row.action_text,
    active: Boolean(row.active),
    icon: row.icon ?? "bolt",
    iconBg: row.icon_bg ?? "rgba(96,165,250,0.1)",
    iconColor: row.icon_color ?? "#60a5fa",
  }));
}

// ─── Notifications (from DB) ───

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const { data, error } = await insforge.database
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    console.warn("[API] Falling back to mock notifications:", error?.message);
    return mockDashboardData.notifications;
  }

  return data.map((row) => ({
    id: row.id,
    icon: row.icon ?? "bell",
    iconBg: row.icon_bg ?? "rgba(96,165,250,0.1)",
    iconColor: row.icon_color ?? "#60a5fa",
    title: row.title,
    description: row.description ?? "",
    time: formatTimeAgo(row.created_at),
    unread: Boolean(row.unread),
  }));
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
