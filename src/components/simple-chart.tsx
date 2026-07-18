interface SimpleChartProps {
  data: { time: string; production: number; consumption: number }[];
  color: string;
  gradientId: string;
  height?: number;
  loading?: boolean;
  showBoth?: boolean;
  secondColor?: string;
}

export default function SimpleChart({
  data,
  color,
  gradientId,
  height = 180,
  loading,
  showBoth = false,
  secondColor = "#60a5fa",
}: SimpleChartProps) {
  if (loading) {
    return (
      <div
        className="w-full bg-[#0b0e14] rounded-lg animate-pulse"
        style={{ height }}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="w-full bg-[#0b0e14] rounded-lg flex items-center justify-center text-xs text-[#5a6d8a]"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const maxVal = Math.max(
    ...data.map((d) =>
      showBoth
        ? Math.max(d.production, d.consumption)
        : Math.max(d.production, d.consumption)
    ),
    1
  );
  const w = 400;
  const h = height;
  const padding = { top: 10, bottom: 20, left: 0, right: 0 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const toX = (i: number) =>
    padding.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => padding.top + chartH - (v / maxVal) * chartH;

  const prodPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.production).toFixed(1)}`)
    .join(" ");

  const prodArea = `${prodPath} L${toX(data.length - 1).toFixed(1)},${(padding.top + chartH).toFixed(1)} L${toX(0).toFixed(1)},${(padding.top + chartH).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        {showBoth && (
          <linearGradient id={`${gradientId}Cons`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={secondColor} stopOpacity="0.02" />
          </linearGradient>
        )}
      </defs>
      {/* Production area + line */}
      <path d={prodArea} fill={`url(#${gradientId})`} />
      <path
        d={prodPath}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Consumption line (when merged) */}
      {showBoth && (
        <>
          <path
            d={data
              .map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.consumption).toFixed(1)}`)
              .join(" ")}
            stroke={secondColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 3"
          />
        </>
      )}
      {/* Time labels */}
      {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
        <text
          key={i}
          x={toX(i)}
          y={h - 4}
          textAnchor="middle"
          fill="#5a6d8a"
          fontSize="9"
          fontFamily="Inter, sans-serif"
        >
          {data[i]?.time || ""}
        </text>
      ))}
    </svg>
  );
}
