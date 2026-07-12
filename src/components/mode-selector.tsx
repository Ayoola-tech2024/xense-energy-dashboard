"use client";

import type { Mode } from "@/lib/types";
import { setMode } from "@/lib/api-service";
import { useState } from "react";

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange?: (mode: Mode) => void;
}

const modes: { key: Mode; label: string; icon: string; desc: string }[] = [
  {
    key: "xense",
    label: "Xense",
    icon: "bolt",
    desc: "Smart plug auto-decides based on priorities.",
  },
  {
    key: "bypass",
    label: "Bypass",
    icon: "forward",
    desc: "Xense disabled. Manual control active.",
  },
  {
    key: "auto",
    label: "Auto",
    icon: "arrows-rotate",
    desc: "Xense active + grid backup permitted.",
  },
];

export default function ModeSelector({
  currentMode,
  onModeChange,
}: ModeSelectorProps) {
  const [active, setActive] = useState<Mode>(currentMode);
  const [loading, setLoading] = useState(false);

  const handleClick = async (mode: Mode) => {
    if (mode === active || loading) return;
    setLoading(true);
    try {
      await setMode("xs-plug-001", mode);
      setActive(mode);
      onModeChange?.(mode);
    } catch (err) {
      console.error("Failed to set mode:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {modes.map((mode) => {
        const isActive = active === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => handleClick(mode.key)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-sans transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-[rgba(45,212,191,0.12)] border-[#2dd4bf] text-[#2dd4bf] border"
                : "bg-transparent border border-[#1e293b] text-[#8899b4] hover:border-[#2dd4bf] hover:text-[#2dd4bf]"
            } ${loading ? "opacity-60 cursor-wait" : ""}`}
            title={mode.desc}
          >
            <i className={`fas fa-${mode.icon} text-xs`} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
