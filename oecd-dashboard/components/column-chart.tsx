/**
 * Vertical column chart — used for sector breakdowns and similar categorical
 * comparisons. Hand-rolled SVG.
 */
import { formatUSD } from "@/lib/format";

export type ColumnDatum = {
  label: string;
  value: number;
  highlight?: boolean;
};

export function ColumnChart({
  data,
  height = 260,
  unit = "USD",
  rotateLabels = true,
}: {
  data: ColumnDatum[];
  height?: number;
  unit?: "USD" | "count";
  rotateLabels?: boolean;
}) {
  if (!data.length) return null;
  const maxV = Math.max(...data.map((d) => d.value));
  const PAD_L = 56;
  const PAD_R = 12;
  const PAD_T = 16;
  const PAD_B = rotateLabels ? 92 : 32;
  const W = 720;
  const H = height + (rotateLabels ? 60 : 0);
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const colW = innerW / data.length;
  const barW = Math.max(8, colW * 0.66);

  const ticks = niceTicks(maxV, 4);
  const yMax = ticks[ticks.length - 1];
  const yPos = (y: number) => PAD_T + innerH - (y / yMax) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
      {/* y grid */}
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
              fontSize={11}
              fontFamily="var(--font-geist-mono)"
              fill="var(--subtle)"
            >
              {unit === "USD" ? formatUSD(t) : t.toLocaleString()}
            </text>
          </g>
        );
      })}
      {/* bars */}
      {data.map((d, i) => {
        const x = PAD_L + i * colW + (colW - barW) / 2;
        const y = yPos(d.value);
        const h = innerH + PAD_T - y;
        const color = d.highlight ? "var(--accent)" : "var(--primary)";
        return (
          <g key={d.label + i}>
            <rect x={x} y={y} width={barW} height={Math.max(0, h)} fill={color} rx={2} />
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize={11}
              fontFamily="var(--font-geist-mono)"
              fill="var(--ink)"
            >
              {unit === "USD" ? formatUSD(d.value) : d.value.toLocaleString()}
            </text>
            {rotateLabels ? (
              <text
                x={x + barW / 2}
                y={H - PAD_B + 14}
                textAnchor="end"
                fontSize={11}
                fill="var(--muted)"
                transform={`rotate(-32 ${x + barW / 2} ${H - PAD_B + 14})`}
              >
                {d.label}
              </text>
            ) : (
              <text
                x={x + barW / 2}
                y={H - PAD_B + 14}
                textAnchor="middle"
                fontSize={11}
                fill="var(--muted)"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
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
