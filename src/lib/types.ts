// ─── Energy Data Types ───

export type Mode = "xense" | "bypass" | "auto";

export type RelayState = "closed" | "open";

export type GridStatus = "available" | "unavailable";

export type DeviceStatus = "online" | "offline" | "pending";

export interface LiveData {
  device_id: string;
  timestamp: string;
  battery_percent: number;
  battery_voltage: number;
  battery_temperature: number;
  battery_charging: boolean;
  battery_discharging: boolean;
  pv_voltage: number;
  pv_current: number;
  pv_power: number;
  load_power: number;
  grid_power: number;
  grid_status: GridStatus;
  frequency: number;
  ac_voltage: number;
  today_production: number;
  today_consumption: number;
  relay_state: RelayState;
  mode: Mode;
  device_online: DeviceStatus;
  wifi_strength: number;
  firmware_version: string;
  inverter_temperature: number;
}

export interface Device {
  id: string;
  name: string;
  appliance: string;
  location: string;
  status: DeviceStatus;
  mode: Mode;
  power: number;
  signal: number;
  online: boolean;
  relay_on: boolean;
}

export interface AiDecision {
  id: number;
  appliance: string;
  icon: string;
  status: "on" | "off" | "standby";
  reason: string;
  time: string;
  load: number;
  confidence: string;
  duration?: string;
  priority: number;
}

export interface AutomationRule {
  id: number;
  condition: string;
  action: string;
  active: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface PriorityItem {
  rank: number;
  name: string;
  power: number;
  tag: string;
  tagColor: string;
  essential: boolean;
}

export interface NotificationItem {
  id: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

export interface ChartData {
  time: string;
  production: number;
  consumption: number;
}

export interface EnergyTotals {
  total_production: number;
  total_consumption: number;
  energy_saved: number;
  co2_avoided: number;
  savings_percent: number;
}

export interface DashboardData {
  live: LiveData;
  devices: Device[];
  decisions: AiDecision[];
  rules: AutomationRule[];
  priorities: PriorityItem[];
  notifications: NotificationItem[];
  chartData: ChartData[];
  totals: EnergyTotals;
}
