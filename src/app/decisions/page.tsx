"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import DecisionCard from "@/components/decision-card";
import { fetchDashboardData } from "@/lib/api-service";
import type { DashboardData } from "@/lib/types";

export default function DecisionsPage() {
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
        <p className="text-[#8899b4] text-sm">Loading decisions...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="AI Load Decisions"
          subtitle="Every decision Xense makes is explained — full transparency on why your appliances turn on or off"
        />
        <main className="flex-1 p-5 lg:p-7 space-y-4 page-enter">
          {/* Period Tabs */}
          <div className="flex gap-1 bg-[#0b0e14] rounded-[10px] p-0.5 w-fit">
            {["Today", "Last 7 Days", "History"].map((p) => (
              <button
                key={p}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  p === "Today"
                    ? "bg-[#12171f] text-[#e8edf5]"
                    : "text-[#8899b4] hover:text-[#e8edf5]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Decision cards */}
          <div className="space-y-2.5">
            {data.decisions.map((d) => (
              <DecisionCard key={d.id} {...d} />
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-check-circle text-[#34d399] mr-1.5" />
                Active Decisions
              </div>
              <div className="text-xl font-bold text-[#e8edf5]">2</div>
              <div className="text-[10px] text-[#5a6d8a] mt-0.5">
                Appliances currently ON
              </div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-power-off text-[#f87171] mr-1.5" />
                Disconnected
              </div>
              <div className="text-xl font-bold text-[#f87171]">1</div>
              <div className="text-[10px] text-[#5a6d8a] mt-0.5">
                By Xense logic
              </div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-clock text-[#fbbf24] mr-1.5" />
                Pending
              </div>
              <div className="text-xl font-bold text-[#fbbf24]">1</div>
              <div className="text-[10px] text-[#5a6d8a] mt-0.5">
                Awaiting conditions
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
