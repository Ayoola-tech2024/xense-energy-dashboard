"use client";

import { useEffect, useRef } from "react";

interface BatteryGaugeProps {
  percent: number;
  voltage: number;
  temperature?: number;
  charging?: boolean;
  size?: number;
  className?: string;
}

export default function BatteryGauge({
  percent,
  voltage,
  temperature,
  charging,
  size = 160,
  className = "",
}: BatteryGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPercentRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    const lw = size * 0.085;

    // Animate
    const targetPct = percent / 100;
    const startPct = prevPercentRef.current / 100;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentPct = startPct + (targetPct - startPct) * eased;

      ctx.clearRect(0, 0, size, size);

      // Background track
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0.75 * Math.PI, 2.25 * Math.PI);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.stroke();

      // Gradient fill
      const gradient = ctx.createConicGradient(0.75 * Math.PI, cx, cy);
      gradient.addColorStop(0, "#fbbf24");
      gradient.addColorStop(currentPct * 0.85, "#2dd4bf");
      gradient.addColorStop(currentPct, "#34d399");

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0.75 * Math.PI, (0.75 + currentPct * 1.5) * Math.PI);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.stroke();

      // Glow
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0.75 * Math.PI, (0.75 + currentPct * 1.5) * Math.PI);
      ctx.strokeStyle = "rgba(45,212,191,0.12)";
      ctx.lineWidth = lw + 6;
      ctx.lineCap = "round";
      ctx.stroke();

      // Tick marks
      for (let i = 0; i <= 10; i++) {
        const angle = 0.75 * Math.PI + (i / 10) * 1.5 * Math.PI;
        const len = i % 2 === 0 ? 6 : 3;
        const inner = r - lw / 2 - 8;
        const outer = inner - len;
        ctx.beginPath();
        ctx.moveTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle));
        ctx.lineTo(cx + outer * Math.cos(angle), cy + outer * Math.sin(angle));
        ctx.strokeStyle = i * 10 <= percent ? "#2dd4bf" : "#1e293b";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevPercentRef.current = percent;
      }
    };

    requestAnimationFrame(animate);
  }, [percent, size]);

  const getColor = () => {
    if (percent <= 20) return "#f87171";
    if (percent <= 40) return "#fbbf24";
    return "#34d399";
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="w-full"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{ marginTop: -4 }}
      >
        <div
          className="text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight leading-none"
          style={{ color: getColor() }}
        >
          {percent}
          <span className="text-[clamp(12px,2vw,16px)] font-medium text-[#8899b4]">
            %
          </span>
        </div>
        <div className="text-xs text-[#64748b] mt-0.5">
          {voltage}V{charging ? " · Charging" : ""}
          {temperature ? ` · ${temperature}°C` : ""}
        </div>
      </div>
    </div>
  );
}
