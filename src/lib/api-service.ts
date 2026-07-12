// ─── API Service Layer ───
// Currently uses mock data. When the real API is ready,
// just swap the implementations below to make actual HTTP calls.

import { mockDashboardData } from "./mock-data";
import type {
  DashboardData,
  LiveData,
  Device,
  AiDecision,
  AutomationRule,
  NotificationItem,
  Mode,
} from "./types";

// Simulate network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function fetchDashboardData(): Promise<DashboardData> {
  await delay(300);
  // 🔁 Replace with: const res = await fetch("https://api.xense.energy/dashboard");
  // return res.json();
  return mockDashboardData;
}

export async function fetchLiveData(): Promise<LiveData> {
  await delay(200);
  // 🔁 Replace with: const res = await fetch("https://api.xense.energy/live");
  // return res.json();
  return mockDashboardData.live;
}

export async function fetchDevices(): Promise<Device[]> {
  await delay(200);
  // 🔁 Replace with: const res = await fetch("https://api.xense.energy/devices");
  // return res.json();
  return mockDashboardData.devices;
}

export async function fetchDecisions(): Promise<AiDecision[]> {
  await delay(200);
  // 🔁 Replace with: const res = await fetch("https://api.xense.energy/decisions");
  // return res.json();
  return mockDashboardData.decisions;
}

export async function fetchRules(): Promise<AutomationRule[]> {
  await delay(200);
  // 🔁 Replace with: const res = await fetch("https://api.xense.energy/rules");
  // return res.json();
  return mockDashboardData.rules;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  await delay(200);
  // 🔁 Replace with: const res = await fetch("https://api.xense.energy/notifications");
  // return res.json();
  return mockDashboardData.notifications;
}

export async function setMode(deviceId: string, mode: Mode): Promise<void> {
  await delay(100);
  // 🔁 Replace with: await fetch(`https://api.xense.energy/devices/${deviceId}/mode`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ mode }),
  // });
  console.log(`[API] Set ${deviceId} mode to ${mode}`);
}

export async function setRelay(
  deviceId: string,
  state: "on" | "off"
): Promise<void> {
  await delay(100);
  // 🔁 Replace with: await fetch(`https://api.xense.energy/devices/${deviceId}/relay`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ state }),
  // });
  console.log(`[API] Set ${deviceId} relay to ${state}`);
}
