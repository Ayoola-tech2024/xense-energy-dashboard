import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: string;
  iconBg: string;
  iconColor: string;
  change?: { value: string; up?: boolean };
  sub?: string;
  valueClassName?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  change,
  sub,
  valueClassName,
}: StatCardProps) {
  return (
    <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-[18px] transition-all duration-200 hover:border-[#2a3a54]">
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg mb-3.5"
        style={{ background: iconBg, color: iconColor }}
      >
        <i className={`fas fa-${icon}`} />
      </div>
      <div className="text-xs text-[#8899b4] font-medium">{label}</div>
      <div
        className={`text-[clamp(20px,2.5vw,28px)] font-bold mt-1 tracking-tight leading-tight ${
          valueClassName || ""
        }`}
      >
        {value}
      </div>
      {change && (
        <div
          className={`text-xs mt-1 flex items-center gap-1 ${
            change.up ? "text-[#34d399]" : "text-[#f87171]"
          }`}
        >
          <i className={`fas fa-arrow-${change.up ? "up" : "down"} text-[10px]`} />
          {change.value}
        </div>
      )}
      {sub && <div className="text-xs text-[#5a6d8a] mt-0.5">{sub}</div>}
    </div>
  );
}
