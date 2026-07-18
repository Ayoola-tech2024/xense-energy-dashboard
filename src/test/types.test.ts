import { describe, it, expect } from "vitest";
import type {
  LiveData,
  Device,
  AiDecision,
  AutomationRule,
  NotificationItem,
  DashboardData,
} from "@/lib/types";

describe("Type definitions", () => {
  it("LiveData has all required fields", () => {
    const live: LiveData = {
      device_id: "test",
      timestamp: new Date().toISOString(),
      battery_percent: 72,
      battery_voltage: 48.2,
      battery_temperature: 25,
      battery_charging: true,
      battery_discharging: false,
      pv_voltage: 120,
      pv_current: 15,
      pv_power: 1800,
      load_power: 600,
      grid_power: 0,
      grid_status: "available",
      frequency: 50.1,
      ac_voltage: 230,
      today_production: 4.2,
      today_consumption: 2.1,
      relay_state: "closed",
      mode: "xense",
      device_online: "online",
      wifi_strength: -48,
      firmware_version: "v2.1.3",
      inverter_temperature: 38,
    };
    expect(live.device_id).toBe("test");
    expect(live.battery_percent).toBe(72);
    expect(live.mode).toBe("xense");
  });

  it("Device has all required fields", () => {
    const device: Device = {
      id: "esp32-xs-001",
      name: "XS-PLUG-001",
      appliance: "Air Conditioner",
      location: "Bedroom",
      status: "online",
      mode: "xense",
      power: 1200,
      signal: -52,
      online: true,
      relay_on: true,
    };
    expect(device.appliance).toBe("Air Conditioner");
    expect(device.relay_on).toBe(true);
  });

  it("AiDecision has all required fields", () => {
    const decision: AiDecision = {
      id: 1,
      appliance: "Freezer",
      icon: "snowflake",
      status: "off",
      reason: "Battery low",
      time: "2:42 PM",
      load: 350,
      confidence: "Required",
      priority: 3,
    };
    expect(decision.status).toBe("off");
    expect(decision.confidence).toBe("Required");
  });

  it("DashboardData contains all sections", () => {
    const data: DashboardData = {
      live: {} as LiveData,
      devices: [],
      decisions: [],
      rules: [],
      priorities: [],
      notifications: [],
      chartData: [],
      totals: {
        total_production: 0,
        total_consumption: 0,
        energy_saved: 0,
        co2_avoided: 0,
        savings_percent: 0,
      },
    };
    expect(data.devices).toEqual([]);
    expect(data.decisions).toEqual([]);
    expect(data.totals.co2_avoided).toBe(0);
  });
});
