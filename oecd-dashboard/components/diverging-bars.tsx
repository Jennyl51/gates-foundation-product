/**
 * Horizontal diverging bars. One row per category, bars extending left
 * (negative) or right (positive) from a center axis. Used for the goal-
 * misalignment chart, where 17 SDG goals were too crowded as columns.
 *
 * Each row reads naturally left-to-right: rank, label, bar, value.
 */

export type DivergingDatum = {
  /** Required short label */
  label: string;
  /** Optional rank or number prefix shown in muted color */
  prefix?: string;
  /** The signed metric value */
  value: number;
};

export function DivergingBars({
  data,
  positiveLabel = "Above zero",
  negativeLabel = "Below zero",
  unit = "pp",
  rowHeight = 30,
}: {
  data: DivergingDatum[];
  positiveLabel?: string;
  negativeLabel?: string;
  unit?: "pp" | "USD" | "count";
  rowHeight?: number;
}) {
  if (!data.length) return null;

  const absMax = Math.max(...data.map((d) => Math.abs(d.value))) || 1;
  const niceMax = niceCeiling(absMax);

  const fmt = (v: number) =>
    unit === "pp"
      ? `${v >= 0 ? "+" : ""}${v.toFixed(1)} pp`
      : unit === "USD"
        ? `${v >= 0 ? "+" : ""}$${Math.abs(v).toFixed(0)}M`
        : `${v >= 0 ? "+" : ""}${v.toFixed(0)}`;

  return (
    <div className="w-full">
      {/* legend */}
      <div className="flex items-center gap-5 mb-4 text-[12px] text-ink">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: "var(--primary)" }}
          />
          {positiveLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: "var(--alert)" }}
          />
          {negativeLabel}
        </span>
        <span className="ml-auto font-mono text-[11px] text-[var(--muted)]">
          Range: {fmt(-niceMax)} to {fmt(niceMax)}
        </span>
      </div>

      <div className="space-y-1">
        {data.map((d) => {
          const positive = d.value >= 0;
          const widthPct = (Math.abs(d.value) / niceMax) * 50; // 50% = full half-side
          return (
            <div
              key={d.label}
              className="grid grid-cols-[180px_1fr_70px] items-center gap-3"
              style={{ height: rowHeight }}
            >
              {/* label */}
              <div className="flex items-baseline gap-2 min-w-0">
                {d.prefix && (
                  <span className="font-mono text-[11px] text-[var(--muted)] tabular-nums shrink-0 w-5 text-right">
                    {d.prefix}
                  </span>
                )}
                <span
                  className="text-[13px] text-ink truncate"
                  title={d.label}
                >
                  {d.label}
                </span>
              </div>

              {/* bar lane with center axis */}
              <div className="relative h-full" style={{ minHeight: 18 }}>
                {/* background lane */}
                <div className="absolute inset-y-2 inset-x-0 bg-[var(--border)] rounded-sm opacity-40" />
                {/* center axis */}
                <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--ink)] opacity-60" />
                {/* bar */}
                <div
                  className="absolute top-1.5 bottom-1.5 rounded-sm transition-[width]"
                  style={{
                    left: positive ? "50%" : `${50 - widthPct}%`,
                    width: `${widthPct}%`,
                    background: positive
                      ? "var(--primary)"
                      : "var(--alert)",
                    opacity: 0.85,
                  }}
                />
              </div>

              {/* value */}
              <div
                className="font-mono tabular-nums text-[13px] text-right font-medium"
                style={{
                  color: positive ? "var(--primary)" : "var(--alert)",
                }}
              >
                {fmt(d.value)}
              </div>
            </div>
          );
        })}
      </div>

      {/* axis ticks */}
      <div className="grid grid-cols-[180px_1fr_70px] gap-3 mt-2">
        <div />
        <div className="relative text-[11px] font-mono text-[var(--muted)]">
          <span className="absolute left-0 -translate-x-0">{fmt(-niceMax)}</span>
          <span className="absolute left-1/2 -translate-x-1/2">0</span>
          <span className="absolute right-0">{fmt(niceMax)}</span>
        </div>
        <div />
      </div>
    </div>
  );
}

function niceCeiling(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const fraction = v / base;
  let nice;
  if (fraction <= 1) nice = 1;
  else if (fraction <= 2) nice = 2;
  else if (fraction <= 5) nice = 5;
  else nice = 10;
  return nice * base;
}
