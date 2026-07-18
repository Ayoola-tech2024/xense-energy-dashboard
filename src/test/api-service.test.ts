import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the insforge module
vi.mock("@/lib/insforge", () => ({
  insforge: {
    database: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

describe("API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchDevices returns mock data on error", async () => {
    const { fetchDevices } = await import("@/lib/api-service");
    const devices = await fetchDevices();
    // Should fall back to mock data when API returns null
    expect(Array.isArray(devices)).toBe(true);
    expect(devices.length).toBeGreaterThan(0);
  });

  it("fetchDecisions returns mock data on error", async () => {
    const { fetchDecisions } = await import("@/lib/api-service");
    const decisions = await fetchDecisions();
    expect(Array.isArray(decisions)).toBe(true);
    expect(decisions.length).toBeGreaterThan(0);
  });

  it("fetchRules returns mock data on error", async () => {
    const { fetchRules } = await import("@/lib/api-service");
    const rules = await fetchRules();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
  });

  it("fetchNotifications returns mock data on error", async () => {
    const { fetchNotifications } = await import("@/lib/api-service");
    const notifications = await fetchNotifications();
    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.length).toBeGreaterThan(0);
  });

  it("fetchLiveData returns mock data on error", async () => {
    const { fetchLiveData } = await import("@/lib/api-service");
    const live = await fetchLiveData();
    expect(live.device_id).toBeDefined();
    expect(live.battery_percent).toBeGreaterThanOrEqual(0);
  });

  it("fetchChartData returns mock data on error", async () => {
    const { fetchChartData } = await import("@/lib/api-service");
    const chart = await fetchChartData();
    expect(Array.isArray(chart)).toBe(true);
    expect(chart.length).toBeGreaterThan(0);
  });

  it("fetchEnergyTotals returns mock data on error", async () => {
    const { fetchEnergyTotals } = await import("@/lib/api-service");
    const totals = await fetchEnergyTotals();
    expect(totals.total_production).toBeGreaterThanOrEqual(0);
    expect(totals.co2_avoided).toBeGreaterThanOrEqual(0);
  });
});
