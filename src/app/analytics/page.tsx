"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import StatCard from "@/components/stat-card";
import SimpleChart from "@/components/simple-chart";
import { fetchDashboardData } from "@/lib/api-service";
import type { DashboardData } from "@/lib/types";

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("Today");

  useEffect(() => {
    fetchDashboardData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0e14]">
        <p className="text-[#8899b4] text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  const { chartData, totals } = data;
  const periods = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Energy Analytics"
          subtitle="Track your solar production, consumption, and savings over time"
        />
        <main className="flex-1 p-5 lg:p-7 space-y-4 page-enter">
          {/* Period Tabs */}
          <div className="flex gap-1 bg-[#0b0e14] rounded-[10px] p-0.5 w-fit">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  period === p
                    ? "bg-[#12171f] text-[#e8edf5]"
                    : "text-[#8899b4] hover:text-[#e8edf5]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#8899b4]">
                  Solar Production
                </h3>
                <span className="text-sm font-bold text-[#fbbf24]">
                  {data.live.today_production} kWh
                </span>
              </div>
              <SimpleChart
                data={chartData}
                color="#fbbf24"
                gradientId="prodGradAnalytics"
                height={180}
              />
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#8899b4]">
                  Consumption
                </h3>
                <span className="text-sm font-bold text-[#60a5fa]">
                  {data.live.today_consumption} kWh
                </span>
              </div>
              <SimpleChart
                data={chartData.map((d) => ({
                  ...d,
                  production: d.consumption,
                }))}
                color="#60a5fa"
                gradientId="consGradAnalytics"
                height={180}
              />
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total Production"
              value={`${totals.total_production} kWh`}
              icon="sun"
              iconBg="rgba(251,191,36,0.1)"
              iconColor="#fbbf24"
              sub="This month"
              valueClassName="text-[#fbbf24]"
            />
            <StatCard
              label="Total Consumption"
              value={`${totals.total_consumption} kWh`}
              icon="bolt"
              iconBg="rgba(96,165,250,0.1)"
              iconColor="#60a5fa"
              sub="This month"
              valueClassName="text-[#60a5fa]"
            />
            <StatCard
              label="Energy Saved"
              value={`${totals.energy_saved} kWh`}
              icon="leaf"
              iconBg="rgba(52,211,153,0.1)"
              iconColor="#34d399"
              change={{ value: `${totals.savings_percent}% surplus`, up: true }}
              valueClassName="text-[#34d399]"
            />
            <StatCard
              label="CO₂ Avoided"
              value={`${totals.co2_avoided} kg`}
              icon="tree"
              iconBg="rgba(52,211,153,0.1)"
              iconColor="#34d399"
              sub="Equivalent to planting 4 trees"
              valueClassName="text-[#34d399]"
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-sun text-[#fbbf24] mr-1.5" />
                Peak Production
              </div>
              <div className="text-xl font-bold text-[#e8edf5]">3.8 kW</div>
              <div className="text-[10px] text-[#5a6d8a] mt-0.5">
                Today at 1:00 PM
              </div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-bolt text-[#60a5fa] mr-1.5" />
                Peak Load
              </div>
              <div className="text-xl font-bold text-[#e8edf5]">1.2 kW</div>
              <div className="text-[10px] text-[#5a6d8a] mt-0.5">
                Today at 2:30 PM
              </div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-clock text-[#2dd4bf] mr-1.5" />
                System Runtime
              </div>
              <div className="text-xl font-bold text-[#e8edf5]">16h 34m</div>
              <div className="text-[10px] text-[#5a6d8a] mt-0.5">
                Today
              </div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-cloud-sun text-[#a78bfa] mr-1.5" />
                Grid Dependency
              </div>
              <div className="text-xl font-bold text-[#34d399]">0%</div>
              <div className="text-[10px] text-[#5a6d8a] mt-0.5">
                Fully solar-powered
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
