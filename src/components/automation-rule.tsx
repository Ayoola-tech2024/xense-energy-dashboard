"use client";

import { useState } from "react";
import type { AutomationRule } from "@/lib/types";

interface AutomationRuleProps {
  rule: AutomationRule;
  onToggle?: (id: number, active: boolean) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const iconMap: Record<string, string> = {
  sun: "fa-sun",
  "battery-low": "fa-battery-quarter",
  bolt: "fa-bolt",
  clock: "fa-clock",
};

export default function AutomationRuleCard({
  rule,
  onToggle,
}: AutomationRuleProps) {
  const [active, setActive] = useState(rule.active);
  const iconClass = iconMap[rule.icon] || `fa-${rule.icon}`;

  const handleToggle = () => {
    const newActive = !active;
    setActive(newActive);
    onToggle?.(rule.id, newActive);
  };

  return (
    <div className="flex items-center gap-3.5 p-4 rounded-[10px] bg-[#0b0e14] border border-[#1e293b] transition-all duration-200 hover:border-[#2a3a54]">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
        style={{ background: rule.iconBg, color: rule.iconColor }}
      >
        <i className={`fas ${iconClass}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#e8edf5]">
          {rule.condition}
        </div>
        <div className="text-xs text-[#8899b4] mt-0.5">
          <i className="fas fa-power-off text-[#2dd4bf] mr-1" />
          {rule.action}
        </div>
      </div>

      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
          active
            ? "bg-[rgba(52,211,153,0.1)] text-[#34d399]"
            : "bg-[rgba(251,191,36,0.1)] text-[#fbbf24]"
        }`}
      >
        {active ? "Active" : "Inactive"}
      </span>

      <button
        onClick={handleToggle}
        className={`relative w-[40px] h-[22px] rounded-full transition-colors duration-200 shrink-0 ${
          active ? "bg-[#2dd4bf]" : "bg-[#1e293b]"
        } cursor-pointer`}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-all duration-200 ${
            active ? "left-[21px]" : "left-[3px]"
          }`}
        />
      </button>

      <div className="flex gap-1 shrink-0">
        <button className="w-7 h-7 rounded-md border border-[#1e293b] bg-transparent text-[#5a6d8a] hover:border-[#8899b4] hover:text-[#e8edf5] transition-all flex items-center justify-center cursor-pointer">
          <i className="fas fa-pen text-[10px]" />
        </button>
        <button className="w-7 h-7 rounded-md border border-[#1e293b] bg-transparent text-[#5a6d8a] hover:border-[#f87171] hover:text-[#f87171] transition-all flex items-center justify-center cursor-pointer">
          <i className="fas fa-trash-can text-[10px]" />
        </button>
      </div>
    </div>
  );
}
