"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import AutomationRuleCard from "@/components/automation-rule";
import { fetchDashboardData } from "@/lib/api-service";
import type { DashboardData } from "@/lib/types";

export default function AutomationPage() {
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
        <p className="text-[#8899b4] text-sm">Loading automation rules...</p>
      </div>
    );
  }

  if (!data) return null;

  const activeRules = data.rules.filter((r) => r.active).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Automation Rules"
          subtitle="Create smart rules that automatically control your appliances based on energy conditions"
        />
        <main className="flex-1 p-5 lg:p-7 space-y-4 page-enter">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-robot text-[#2dd4bf] mr-1.5" />
                Total Rules
              </div>
              <div className="text-xl font-bold text-[#e8edf5]">
                {data.rules.length}
              </div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-check-circle text-[#34d399] mr-1.5" />
                Active
              </div>
              <div className="text-xl font-bold text-[#34d399]">
                {activeRules}
              </div>
            </div>
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold mb-1">
                <i className="fas fa-pause-circle text-[#fbbf24] mr-1.5" />
                Inactive
              </div>
              <div className="text-xl font-bold text-[#fbbf24]">
                {data.rules.length - activeRules}
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-2.5">
            {data.rules.map((rule) => (
              <AutomationRuleCard key={rule.id} rule={rule} />
            ))}
          </div>

          {/* Quick Rule Builder */}
          <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
            <h3 className="text-sm font-semibold text-[#e8edf5] mb-4">
              Quick Rule Builder
            </h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <select className="bg-[#0b0e14] border border-[#1e293b] text-[#e8edf5] px-3 py-2 rounded-lg text-xs font-sans focus:border-[#2dd4bf] outline-none">
                <option>Battery Level</option>
                <option>Solar Production</option>
                <option>Grid Status</option>
                <option>Time of Day</option>
              </select>
              <select className="bg-[#0b0e14] border border-[#1e293b] text-[#e8edf5] px-3 py-2 rounded-lg text-xs font-sans focus:border-[#2dd4bf] outline-none">
                <option>&gt; (greater than)</option>
                <option>&lt; (less than)</option>
                <option>= (equals)</option>
              </select>
              <input
                type="number"
                placeholder="80"
                className="bg-[#0b0e14] border border-[#1e293b] text-[#e8edf5] px-3 py-2 rounded-lg text-xs font-sans w-20 focus:border-[#2dd4bf] outline-none placeholder-[#5a6d8a]"
              />
              <button className="px-4 py-2 rounded-lg bg-[#2dd4bf] text-[#0b0e14] text-xs font-semibold hover:bg-[#14b8a6] transition-all cursor-pointer">
                Add Rule
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
