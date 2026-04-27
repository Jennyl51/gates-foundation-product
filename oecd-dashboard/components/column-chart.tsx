/**
 * Vertical column chart. Hand-rolled SVG, supports both positive-only data
 * (default) and signed data with a zero baseline (for diverging metrics like
 * the goal-misalignment delta).
 */
import { formatUSD } from "@/lib/format";

export type ColumnDatum = {
  label: string;
  value: number;
  highlight?: boolean;
};

export function ColumnChart({
  data,
  height = 280,
  unit = "USD",
  rotateLabels = true,
  signed = false,
  yLabel,
  positiveLabel,
  negativeLabel,
}: {
  data: ColumnDatum[];
  height?: number;
  unit?: "USD" | "count" | "pp";
  rotateLabels?: boolean;
  signed?: boolean;
  yLabel?: string;
  positiveLabel?: string;
  negativeLabel?: string;
}) {
  if (!data.length) return null;

  const maxV = signed ? Math.max(...data.map((d) => d.value), 0) : Math.max(...data.map((d) => d.value));
  const minV = signed ? Math.min(...data.map((d) => d.value), 0) : 0;
  const absMax = Math.max(Math.abs(maxV), Math.abs(minV)) || 1;

  const PAD_L = 64;
  const PAD_R = 16;
  const PAD_T = 24;
  const PAD_B = rotateLabels ? 100 : 36;
  const W = 720;
  const H = height + (rotateLabels ? 70 : 0);
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const colW = innerW / data.length;
  const barW = Math.max(10, colW * 0.66);

  const ticks = signed ? signedTicks(absMax, 4) : niceTicks(maxV, 4);
  const yMin = signed ? -absMax : 0;
  const yMax = signed ? absMax : ticks[ticks.length - 1];
  const yPos = (y: number) => PAD_T + innerH * (1 - (y - yMin) / (yMax - yMin));
  const zeroY = yPos(0);

  const fmt = (v: number) =>
    unit === "USD"
      ? formatUSD(v)
      : unit === "pp"
        ? `${v >= 0 ? "+" : ""}${v.toFixed(1)} pp`
        : v.toLocaleString();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={yLabel ? `Column chart of ${yLabel}` : "Column chart"}>
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

      {/* y grid + tick labels */}
      {ticks.map((t) => {
        const y = yPos(t);
        const isZero = signed && t === 0;
        return (
          <g key={t}>
            <line
              x1={PAD_L}
              x2={PAD_L + innerW}
              y1={y}
              y2={y}
              stroke={isZero ? "var(--ink)" : "var(--border)"}
              strokeWidth={isZero ? 1.2 : 1}
            />
            <text
              x={PAD_L - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={12}
              fontFamily="var(--font-geist-mono)"
              fill="var(--muted)"
            >
              {fmt(t)}
            </text>
          </g>
        );
      })}

      {/* bars */}
      {data.map((d, i) => {
        const x = PAD_L + i * colW + (colW - barW) / 2;
        const y0 = signed ? zeroY : yPos(0);
        const y1 = yPos(d.value);
        const yTop = Math.min(y0, y1);
        const h = Math.abs(y1 - y0);
        const isPos = d.value >= 0;
        const color = signed
          ? isPos
            ? "var(--primary)"
            : "var(--alert)"
          : d.highlight
            ? "var(--accent)"
            : "var(--primary)";
        const labelY = isPos ? yTop - 8 : yTop + h + 14;

        return (
          <g key={d.label + i}>
            <rect x={x} y={yTop} width={barW} height={Math.max(0, h)} fill={color} rx={2} />
            <text
              x={x + barW / 2}
              y={labelY}
              textAnchor="middle"
              fontSize={12}
              fontFamily="var(--font-geist-mono)"
              fill={isPos ? "var(--primary)" : "var(--alert)"}
              fontWeight={500}
            >
              {fmt(d.value)}
            </text>
            {rotateLabels ? (
              <text
                x={x + barW / 2}
                y={H - PAD_B + 16}
                textAnchor="end"
                fontSize={12}
                fill="var(--ink)"
                transform={`rotate(-30 ${x + barW / 2} ${H - PAD_B + 16})`}
              >
                {d.label}
              </text>
            ) : (
              <text
                x={x + barW / 2}
                y={H - PAD_B + 16}
                textAnchor="middle"
                fontSize={12}
                fill="var(--ink)"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}

      {/* legend (signed mode only) */}
      {signed && (positiveLabel || negativeLabel) && (
        <g transform={`translate(${PAD_L} ${H - 8})`}>
          {positiveLabel && (
            <g>
              <rect x={0} y={-10} width={12} height={10} fill="var(--primary)" rx={2} />
              <text x={18} y={-1} fontSize={12} fill="var(--ink)">{positiveLabel}</text>
            </g>
          )}
          {negativeLabel && (
            <g transform="translate(180 0)">
              <rect x={0} y={-10} width={12} height={10} fill="var(--alert)" rx={2} />
              <text x={18} y={-1} fontSize={12} fill="var(--ink)">{negativeLabel}</text>
            </g>
          )}
        </g>
      )}
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
    if (max / (c * base) <= count) {
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

function signedTicks(absMax: number, perSide = 4): number[] {
  // Build symmetric ticks around zero
  const positive = niceTicks(absMax, perSide);
  const last = positive[positive.length - 1];
  const negative = positive.slice(1).map((v) => -v).reverse();
  return [...negative, ...positive].filter((v, i, arr) => arr.indexOf(v) === i)
    .filter((v) => Math.abs(v) <= last);
}
