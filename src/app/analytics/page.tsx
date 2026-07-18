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

          {/* Charts — merged into one */}
          <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#8899b4]">
                Production vs Consumption
              </h3>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-[2px] bg-[#fbbf24] rounded-full inline-block" />
                  <span className="text-[#8899b4]">Production</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-[2px] bg-[#60a5fa] rounded-full inline-block border-dashed" style={{ borderTop: "2px dashed #60a5fa", height: 0, width: 12 }} />
                  <span className="text-[#8899b4]">Consumption</span>
                </span>
              </div>
            </div>
            <SimpleChart
              data={chartData}
              color="#fbbf24"
              gradientId="prodGradAnalytics"
              height={220}
              showBoth
              secondColor="#60a5fa"
            />
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="text-[#fbbf24] font-semibold">{data.live.today_production} kWh produced</span>
              <span className="text-[#60a5fa] font-semibold">{data.live.today_consumption} kWh consumed</span>
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

          {/* Detailed Stats — smaller */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[10px] p-3">
              <div className="text-[9px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-0.5">
                <i className="fas fa-sun text-[#fbbf24] mr-1" />
                Peak Production
              </div>
              <div className="text-lg font-bold text-[#e8edf5]">3.8 kW</div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[10px] p-3">
              <div className="text-[9px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-0.5">
                <i className="fas fa-bolt text-[#60a5fa] mr-1" />
                Peak Load
              </div>
              <div className="text-lg font-bold text-[#e8edf5]">1.2 kW</div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[10px] p-3">
              <div className="text-[9px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-0.5">
                <i className="fas fa-clock text-[#2dd4bf] mr-1" />
                System Runtime
              </div>
              <div className="text-lg font-bold text-[#e8edf5]">16h 34m</div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[10px] p-3">
              <div className="text-[9px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-0.5">
                <i className="fas fa-cloud-sun text-[#a78bfa] mr-1" />
                Grid Dependency
              </div>
              <div className="text-lg font-bold text-[#34d399]">0%</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
