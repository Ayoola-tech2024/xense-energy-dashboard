"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import StatCard from "@/components/stat-card";
import SimpleChart from "@/components/simple-chart";
import BatteryGauge from "@/components/battery-gauge";
import ModeSelector from "@/components/mode-selector";
import DeviceTable from "@/components/device-table";
import DecisionCard from "@/components/decision-card";
import AutomationRuleCard from "@/components/automation-rule";
import { fetchDashboardData } from "@/lib/api-service";
import type { DashboardData } from "@/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0e14]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#2dd4bf] to-[#0891b2] flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-3 animate-pulse">
            X
          </div>
          <p className="text-[#8899b4] text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { live, devices, decisions, rules, chartData } = data;

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Energy Overview"
          subtitle="Real-time monitoring and control of your energy system"
        />
        <main className="flex-1 p-5 lg:p-7 space-y-5 page-enter">

          {/* ── Top KPI Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Solar Production"
              value={
                <>
                  {live.pv_power.toLocaleString()}{" "}
                  <span className="text-sm font-medium">W</span>
                </>
              }
              icon="sun"
              iconBg="rgba(251,191,36,0.1)"
              iconColor="#fbbf24"
              change={{ value: `${live.today_production} kWh today`, up: true }}
            />
            <StatCard
              label="Load Power"
              value={
                <>
                  {live.load_power.toLocaleString()}{" "}
                  <span className="text-sm font-medium">W</span>
                </>
              }
              icon="bolt"
              iconBg="rgba(96,165,250,0.1)"
              iconColor="#60a5fa"
              change={{ value: `${live.today_consumption} kWh today`, up: true }}
            />
            <StatCard
              label="Grid Power"
              value={
                <>
                  {live.grid_power}{" "}
                  <span className="text-sm font-medium">W</span>
                </>
              }
              icon="tower-broadcast"
              iconBg="rgba(167,139,250,0.1)"
              iconColor="#a78bfa"
              sub={live.grid_status === "available" ? "Available" : "Unavailable"}
            />
            <StatCard
              label="CO₂ Saved"
              value={`${data.totals.co2_avoided} kg`}
              icon="leaf"
              iconBg="rgba(52,211,153,0.1)"
              iconColor="#34d399"
              sub="This month"
              valueClassName="text-[#34d399]"
            />
          </div>

          {/* ── Battery + Mode + Chart ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Battery Gauge */}
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5 flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold text-[#8899b4] mb-3">Battery Status</h3>
              <BatteryGauge
                percent={live.battery_percent}
                voltage={live.battery_voltage}
                temperature={live.battery_temperature}
                charging={live.battery_charging}
                size={180}
              />
              <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold">
                    <i className="fas fa-temperature-half text-[#f87171] mr-1" />
                    Temp
                  </div>
                  <div className="text-sm font-bold text-[#e8edf5]">{live.battery_temperature}°C</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold">
                    <i className="fas fa-wifi text-[#2dd4bf] mr-1" />
                    Signal
                  </div>
                  <div className="text-sm font-bold text-[#e8edf5]">{live.wifi_strength} dBm</div>
                </div>
              </div>
            </div>

            {/* Production / Consumption Chart */}
            <div className="lg:col-span-2 bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#8899b4]">Today&apos;s Production vs Consumption</h3>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-[2px] bg-[#fbbf24] rounded-full inline-block" />
                    <span className="text-[#8899b4]">Production</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-[2px] bg-[#60a5fa] rounded-full inline-block" />
                    <span className="text-[#8899b4]">Consumption</span>
                  </span>
                </div>
              </div>
              <SimpleChart
                data={chartData}
                color="#fbbf24"
                gradientId="prodGrad"
                height={200}
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#0b0e14] border border-[#1e293b]">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(251,191,36,0.1)] flex items-center justify-center text-[#fbbf24] text-sm">
                    <i className="fas fa-sun" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5a6d8a]">Produced</div>
                    <div className="text-sm font-bold text-[#fbbf24]">{live.today_production} kWh</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#0b0e14] border border-[#1e293b]">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(96,165,250,0.1)] flex items-center justify-center text-[#60a5fa] text-sm">
                    <i className="fas fa-bolt" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5a6d8a]">Consumed</div>
                    <div className="text-sm font-bold text-[#60a5fa]">{live.today_consumption} kWh</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mode Selector ── */}
          <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#8899b4]">System Mode</h3>
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#34d399]">
                <i className="fas fa-circle text-[8px]" />
                {live.device_online === "online" ? "Connected" : "Disconnected"}
              </span>
            </div>
            <ModeSelector deviceId={live.device_id} currentMode={live.mode} />
            <div className="mt-3 text-center text-[10px] text-[#5a6d8a]">
              <i className="fas fa-info-circle mr-1" />
              Firmware: {live.firmware_version} · Inverter: {live.inverter_temperature}°C · AC: {live.ac_voltage}V · {live.frequency}Hz
            </div>
          </div>

          {/* ── Recent AI Decisions ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#e8edf5]">
                <i className="fas fa-brain text-[#a78bfa] mr-2" />
                Recent AI Decisions
              </h3>
              <a href="/decisions" className="text-xs text-[#2dd4bf] hover:underline">
                View All →
              </a>
            </div>
            <div className="space-y-2.5">
              {decisions.slice(0, 3).map((d) => (
                <DecisionCard key={d.id} {...d} />
              ))}
            </div>
          </div>

          {/* ── Devices + Active Rules ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Devices Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#e8edf5]">
                  <i className="fas fa-plug text-[#2dd4bf] mr-2" />
                  Devices
                </h3>
                <a href="/devices" className="text-xs text-[#2dd4bf] hover:underline">
                  View All →
                </a>
              </div>
              <DeviceTable devices={devices} />
            </div>

            {/* Active Automation Rules */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#e8edf5]">
                  <i className="fas fa-robot text-[#fbbf24] mr-2" />
                  Active Rules
                </h3>
                <a href="/automation" className="text-xs text-[#2dd4bf] hover:underline">
                  View All →
                </a>
              </div>
              <div className="space-y-2.5">
                {rules.filter((r) => r.active).map((rule) => (
                  <AutomationRuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </div>
          </div>

          {/* ── System Stats Footer ── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard
              label="Total Production"
              value={`${data.totals.total_production} kWh`}
              icon="chart-line"
              iconBg="rgba(251,191,36,0.1)"
              iconColor="#fbbf24"
              sub="This month"
            />
            <StatCard
              label="Total Consumption"
              value={`${data.totals.total_consumption} kWh`}
              icon="chart-area"
              iconBg="rgba(96,165,250,0.1)"
              iconColor="#60a5fa"
              sub="This month"
            />
            <StatCard
              label="Energy Saved"
              value={`${data.totals.energy_saved} kWh`}
              icon="leaf"
              iconBg="rgba(52,211,153,0.1)"
              iconColor="#34d399"
              change={{ value: `${data.totals.savings_percent}% surplus`, up: true }}
            />
            <StatCard
              label="Devices"
              value={devices.length}
              icon="plug"
              iconBg="rgba(45,212,191,0.1)"
              iconColor="#2dd4bf"
              sub="All connected"
            />
            <StatCard
              label="Active Rules"
              value={rules.filter((r) => r.active).length}
              icon="robot"
              iconBg="rgba(167,139,250,0.1)"
              iconColor="#a78bfa"
              sub={`of ${rules.length} total`}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
