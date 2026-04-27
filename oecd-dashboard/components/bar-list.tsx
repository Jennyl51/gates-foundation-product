import Link from "next/link";
import { formatUSD } from "@/lib/format";

/**
 * A ranked horizontal bar list — the workhorse chart for "top X by Y".
 *
 *   <BarList
 *     items={[{ label: "Wellcome Trust", value: 2421.25, href: "/donors/wellcome-trust" }]}
 *     valueLabel="USD mn"
 *   />
 *
 * Bars are scaled to the largest value in the list, with optional accent
 * highlighting for a chosen index.
 */
export type BarListItem = {
  label: string;
  value: number;
  sub?: string;
  href?: string;
  highlight?: boolean;
};

export function BarList({
  items,
  max,
  unit = "USD",
  accent = "primary",
  showRank = true,
  emptyMessage = "No data.",
}: {
  items: BarListItem[];
  max?: number;
  unit?: "USD" | "count" | "raw";
  accent?: "primary" | "accent" | "forest";
  showRank?: boolean;
  emptyMessage?: string;
}) {
  if (!items.length) {
    return (
      <div className="text-[14px] text-[var(--muted)] py-6 italic">{emptyMessage}</div>
    );
  }
  const scaleMax = max ?? Math.max(...items.map((i) => i.value));
  const colorVar =
    accent === "accent"
      ? "var(--accent)"
      : accent === "forest"
        ? "var(--forest)"
        : "var(--primary)";
  const softVar =
    accent === "accent"
      ? "var(--accent-soft)"
      : accent === "forest"
        ? "var(--forest-soft)"
        : "var(--primary-soft)";

  return (
    <ol className="space-y-2">
      {items.map((item, idx) => {
        const pctWidth = scaleMax > 0 ? (item.value / scaleMax) * 100 : 0;
        const valueDisplay =
          unit === "USD"
            ? formatUSD(item.value)
            : unit === "count"
              ? item.value.toLocaleString()
              : item.value.toString();
        const inner = (
          <div className="group relative flex items-baseline justify-between gap-3 py-1.5">
            <div className="flex items-baseline gap-3 min-w-0 flex-1">
              {showRank && (
                <span className="font-mono text-[11px] text-[var(--subtle)] w-5 shrink-0 text-right tabular-nums">
                  {idx + 1}
                </span>
              )}
              <span
                className={[
                  "text-[14px] truncate font-medium",
                  "text-ink",
                ].join(" ")}
                title={item.label}
              >
                {item.label}
              </span>
              {item.sub && (
                <span className="text-[12px] text-[var(--muted)] hidden sm:inline">
                  {item.sub}
                </span>
              )}
            </div>
            <span className="font-mono text-[14px] text-ink tabular-nums shrink-0 font-medium">
              {valueDisplay}
            </span>
          </div>
        );
        return (
          <li key={`${item.label}-${idx}`} className="relative">
            {/* track. light tint of the accent so the bar reads against it */}
            <div
              className="absolute inset-x-0 top-1.5 bottom-1.5 rounded-sm"
              style={{ background: softVar }}
            />
            {/* bar. softened to ~0.55 opacity so ink text remains readable on top */}
            <div
              className="absolute left-0 top-1.5 bottom-1.5 rounded-sm transition-[width]"
              style={{
                width: `${pctWidth}%`,
                background: colorVar,
                opacity: item.highlight ? 0.7 : 0.55,
              }}
            />
            {/* content */}
            <div className="relative px-3">
              {item.href ? (
                <Link href={item.href} className="block hover:bg-black/0">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
