interface DecisionCardProps {
  appliance: string;
  icon: string;
  status: "on" | "off" | "standby";
  reason: string;
  time: string;
  load: number;
  confidence: string;
  duration?: string;
}

const statusConfig = {
  on: { bg: "rgba(52,211,153,0.1)", color: "#34d399", label: "ON" },
  off: { bg: "rgba(248,113,113,0.1)", color: "#f87171", label: "OFF" },
  standby: {
    bg: "rgba(251,191,36,0.1)",
    color: "#fbbf24",
    label: "Standby",
  },
};

const iconMap: Record<string, string> = {
  snowflake: "fa-snowflake",
  shower: "fa-shower",
  tv: "fa-tv",
  kitchen: "fa-kitchen-set",
  lightbulb: "fa-lightbulb",
};

export default function DecisionCard({
  appliance,
  icon,
  status,
  reason,
  time,
  load,
  confidence,
  duration,
}: DecisionCardProps) {
  const cfg = statusConfig[status];
  const iconClass = iconMap[icon] || `fa-${icon}`;

  return (
    <div className="flex items-start gap-3.5 p-4 rounded-[10px] bg-[#0b0e14] border border-[#1e293b] transition-all duration-200 hover:border-[#2a3a54]">
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center text-base shrink-0"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        <i className={`fas ${iconClass}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-[#e8edf5]">{appliance}</h4>
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-[#8899b4] mt-0.5">{reason}</p>
        <div className="flex gap-3 text-[10px] text-[#5a6d8a] mt-1">
          <span>
            <i className="far fa-clock mr-1" />
            {time}
          </span>
          <span>
            <i className="fas fa-bolt mr-1" />
            {load.toLocaleString()} W
          </span>
          {duration && <span>Duration: {duration}</span>}
          <span>
            Confidence:{" "}
            <span style={{ color: status === "on" ? "#2dd4bf" : "#f87171" }}>
              {confidence}
            </span>
          </span>
        </div>
      </div>

      <div className="text-right shrink-0 hidden sm:block">
        <span
          className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {status === "on" ? "Powered by Solar" : "Load Disconnected"}
        </span>
        <div className="text-[10px] text-[#5a6d8a] mt-1">
          {status === "on" ? "Decision #2841" : "Smart Save"}
        </div>
      </div>
    </div>
  );
}
