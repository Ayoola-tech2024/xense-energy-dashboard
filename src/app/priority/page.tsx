"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { fetchDashboardData } from "@/lib/api-service";
import type { DashboardData } from "@/lib/types";

export default function PriorityPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [priorities, setPriorities] = useState(data?.priorities || []);

  useEffect(() => {
    fetchDashboardData().then((d) => {
      setData(d);
      setPriorities(d.priorities);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0e14]">
        <p className="text-[#8899b4] text-sm">Loading priority list...</p>
      </div>
    );
  }

  if (!data) return null;

  const rankColors = ["r1", "r2", "r3", "r4", "r5"] as const;
  const rankStyles: Record<string, string> = {
    r1: "bg-[rgba(251,191,36,0.1)] text-[#fbbf24]",
    r2: "bg-[rgba(96,165,250,0.1)] text-[#60a5fa]",
    r3: "bg-[rgba(45,212,191,0.1)] text-[#2dd4bf]",
    r4: "bg-[rgba(248,113,113,0.1)] text-[#f87171]",
    r5: "bg-[rgba(167,139,250,0.1)] text-[#a78bfa]",
  };

  const tagStyles: Record<string, string> = {
    green: "bg-[rgba(52,211,153,0.1)] text-[#34d399]",
    blue: "bg-[rgba(96,165,250,0.1)] text-[#60a5fa]",
    yellow: "bg-[rgba(251,191,36,0.1)] text-[#fbbf24]",
    red: "bg-[rgba(248,113,113,0.1)] text-[#f87171]",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Priority List"
          subtitle="Drag to reorder which appliances get power first when energy is limited"
        />
        <main className="flex-1 p-5 lg:p-7 space-y-4 page-enter">
          <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e8edf5]">
                Appliance Priority
              </h3>
              <span className="text-xs text-[#5a6d8a]">
                <i className="fas fa-grip mr-1" />
                Drag to reorder
              </span>
            </div>
            <div className="space-y-1.5">
              {priorities.map((item, index) => (
                <div
                  key={item.rank}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] bg-[#0b0e14] border border-[#1e293b] transition-all duration-200 hover:border-[#2a3a54] cursor-grab"
                >
                  <i className="fas fa-grip-lines text-[#5a6d8a] text-sm cursor-grab" />
                  <div
                    className={`w-[22px] h-[22px] rounded-md flex items-center justify-center text-[11px] font-bold ${
                      rankStyles[rankColors[index] || "r5"]
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#e8edf5]">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[#8899b4]">
                      {item.power} W
                      {item.essential ? " · Always on" : ""}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      tagStyles[item.tagColor] || tagStyles.green
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
            <h3 className="text-sm font-semibold text-[#e8edf5] mb-3">
              Priority Strategy
            </h3>
            <p className="text-xs text-[#8899b4] leading-relaxed">
              When energy is limited, Xense uses this priority order to decide
              which appliances stay on. <strong className="text-[#e8edf5]">Essential items</strong>{" "}
              (Refrigerator, Lighting) always receive power first.
              <strong className="text-[#e8edf5]"> High-priority loads</strong> are managed next, while
              lower-priority, high-draw appliances like the Water Heater are
              disconnected first to preserve battery runtime.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
