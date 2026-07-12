"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import StatCard from "@/components/stat-card";
import DeviceTable from "@/components/device-table";
import { fetchDashboardData } from "@/lib/api-service";
import type { DashboardData } from "@/lib/types";

export default function DevicesPage() {
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
        <p className="text-[#8899b4] text-sm">Loading devices...</p>
      </div>
    );
  }

  if (!data) return null;

  const totalLoad = data.devices.reduce((sum, d) => sum + d.power, 0);
  const activeLoads = data.devices.filter((d) => d.relay_on).length;
  const disconnected = data.devices.filter((d) => !d.relay_on).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Devices"
          subtitle="Manage all your Xense Smart Plugs and connected appliances"
        />
        <main className="flex-1 p-5 lg:p-7 space-y-4 page-enter">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total Devices"
              value={data.devices.length}
              icon="plug"
              iconBg="rgba(45,212,191,0.1)"
              iconColor="#2dd4bf"
              sub="All online"
            />
            <StatCard
              label="Active Loads"
              value={activeLoads}
              icon="bolt"
              iconBg="rgba(52,211,153,0.1)"
              iconColor="#34d399"
              change={{ value: "Running", up: true }}
            />
            <StatCard
              label="Disconnected"
              value={disconnected}
              icon="power-off"
              iconBg="rgba(248,113,113,0.1)"
              iconColor="#f87171"
              sub="By Xense Logic"
            />
            <StatCard
              label="Total Load"
              value={
                <>
                  {totalLoad.toLocaleString()}{" "}
                  <span className="text-sm font-medium">W</span>
                </>
              }
              icon="chart-simple"
              iconBg="rgba(96,165,250,0.1)"
              iconColor="#60a5fa"
              sub="Of 3.2 kW capacity"
            />
          </div>

          {/* Filter tags */}
          <div className="flex gap-1.5 flex-wrap">
            {["All", "Online", "Active Loads", "Disconnected"].map(
              (tag, i) => (
                <span
                  key={tag}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded ${
                    i === 0
                      ? "bg-[rgba(45,212,191,0.1)] text-[#2dd4bf]"
                      : i === 1
                      ? "bg-[rgba(52,211,153,0.1)] text-[#34d399]"
                      : i === 2
                      ? "bg-[rgba(96,165,250,0.1)] text-[#60a5fa]"
                      : "bg-[rgba(248,113,113,0.1)] text-[#f87171]"
                  }`}
                >
                  {tag}
                </span>
              )
            )}
            <button className="ml-auto text-xs px-3 py-1 rounded-lg border border-[#1e293b] text-[#2dd4bf] hover:bg-[rgba(45,212,191,0.1)] transition-all cursor-pointer">
              <i className="fas fa-plus mr-1" />
              Add Device
            </button>
          </div>

          {/* Device Table */}
          <DeviceTable devices={data.devices} />
        </main>
      </div>
    </div>
  );
}
