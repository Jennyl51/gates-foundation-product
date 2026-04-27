/**
 * Hand-rolled SVG line / area chart — small, editorial, no chart-lib bloat.
 *
 *   <TimeSeriesChart
 *     series={[{ name: "Total", data: [{x: 2020, y: 12.3}, ...] }]}
 *     yLabel="USD mn"
 *   />
 */
import { formatUSD } from "@/lib/format";

export type TSPoint = { x: number | string; y: number };
export type TSSeries = { name: string; data: TSPoint[]; color?: string };

export function TimeSeriesChart({
  series,
  height = 240,
  yLabel,
  emphasizeLast = true,
  unit = "USD",
}: {
  series: TSSeries[];
  height?: number;
  yLabel?: string;
  emphasizeLast?: boolean;
  unit?: "USD" | "count";
}) {
  const allXs = Array.from(
    new Set(series.flatMap((s) => s.data.map((p) => String(p.x))))
  );
  // Sort numerically if all numbers, else alphabetically
  const allXsSorted = allXs
    .map((x) => ({ x, n: Number(x) }))
    .sort((a, b) =>
      Number.isFinite(a.n) && Number.isFinite(b.n) ? a.n - b.n : a.x.localeCompare(b.x)
    )
    .map((d) => d.x);

  const maxY = Math.max(0, ...series.flatMap((s) => s.data.map((p) => p.y)));
  const ticks = niceTicks(maxY, 4);
  const yMax = ticks[ticks.length - 1];

  const PAD_L = 56;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 28;
  const W = 720;
  const H = height;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const xPos = (x: string) => {
    const idx = allXsSorted.indexOf(x);
    if (allXsSorted.length === 1) return PAD_L + innerW / 2;
    return PAD_L + (idx / (allXsSorted.length - 1)) * innerW;
  };
  const yPos = (y: number) => PAD_T + innerH - (y / yMax) * innerH;

  const colors = ["var(--primary)", "var(--accent)", "var(--forest)", "var(--c4)", "var(--c5)", "var(--c6)"];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={yLabel ? `Time series chart: ${yLabel}` : "Time series chart"}
      >
        {/* y-axis title */}
        {yLabel && (
          <text
            x={14}
            y={PAD_T + innerH / 2}
            fontSize={12}
            fontFamily="var(--font-geist-mono)"
            fill="var(--muted)"
            textAnchor="middle"
            transform={`rotate(-90 14 ${PAD_T + innerH / 2})`}
          >
            {yLabel}
          </text>
        )}
        {/* y-axis grid + labels */}
        {ticks.map((t) => {
          const y = yPos(t);
          return (
            <g key={t}>
              <line
                x1={PAD_L}
                x2={PAD_L + innerW}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={PAD_L - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={12}
                fontFamily="var(--font-geist-mono)"
                fill="var(--muted)"
              >
                {unit === "USD" ? formatUSD(t) : t.toLocaleString()}
              </text>
            </g>
          );
        })}
        {/* x-axis labels */}
        {allXsSorted.map((x) => (
          <text
            key={x}
            x={xPos(x)}
            y={H - PAD_B + 18}
            textAnchor="middle"
            fontSize={12}
            fontFamily="var(--font-geist-mono)"
            fill="var(--ink)"
          >
            {x}
          </text>
        ))}
        {/* lines */}
        {series.map((s, i) => {
          const color = s.color ?? colors[i % colors.length];
          const points = s.data
            .slice()
            .sort((a, b) =>
              Number.isFinite(Number(a.x)) ? Number(a.x) - Number(b.x) : 0
            );
          const path = points
            .map(
              (p, j) =>
                `${j === 0 ? "M" : "L"} ${xPos(String(p.x))} ${yPos(p.y)}`
            )
            .join(" ");
          // area path (only for single-series feel)
          const areaPath =
            series.length === 1
              ? `${path} L ${xPos(String(points[points.length - 1].x))} ${yPos(0)} L ${xPos(String(points[0].x))} ${yPos(0)} Z`
              : null;
          return (
            <g key={s.name}>
              {areaPath && (
                <path d={areaPath} fill={color} opacity={0.08} />
              )}
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((p, j) => {
                const last = j === points.length - 1;
                return (
                  <g key={`${s.name}-${p.x}`}>
                    <circle
                      cx={xPos(String(p.x))}
                      cy={yPos(p.y)}
                      r={last && emphasizeLast ? 4 : 2.5}
                      fill={color}
                    />
                    {last && emphasizeLast && (
                      <text
                        x={xPos(String(p.x))}
                        y={yPos(p.y) - 10}
                        textAnchor="middle"
                        fontSize={11}
                        fontFamily="var(--font-geist-mono)"
                        fill={color}
                        fontWeight={600}
                      >
                        {unit === "USD" ? formatUSD(p.y) : p.y.toLocaleString()}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[12px] text-ink">
        {series.map((s, i) => (
          <span key={s.name} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-[3px] rounded-sm"
              style={{ background: s.color ?? colors[i % colors.length] }}
            />
            {s.name}
            {unit === "USD" && (
              <span className="text-[var(--muted)] font-mono ml-1">(USD millions, 2023 constant)</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const exp = Math.floor(Math.log10(max));
  const base = Math.pow(10, exp);
  const candidates = [1, 2, 2.5, 5, 10];
  let step = base;
  for (const c of candidates) {
    if ((max / (c * base)) <= count) {
      step = c * base;
      break;
    }
  }
  const ticks: number[] = [];
  for (let v = 0; v <= max + step / 2; v += step) {
    ticks.push(Number(v.toFixed(6)));
  }
  return ticks;
}
