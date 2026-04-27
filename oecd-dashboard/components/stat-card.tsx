import type { ReactNode } from "react";

/**
 * Big editorial stat tile. Used on the overview hero.
 *
 *   <StatCard label="Total disbursed" value="$68.2B" sub="2020 – 2023" />
 */
export function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "relative rounded-md p-5 md:p-6 border transition-colors",
        accent
          ? "bg-[var(--primary)] border-[var(--primary)] text-white"
          : "bg-[var(--surface)] border-[var(--border)] text-ink",
      ].join(" ")}
    >
      <div
        className={[
          "font-mono text-[11px] tracking-[0.16em] uppercase",
          accent ? "text-white/70" : "text-[var(--accent)]",
        ].join(" ")}
      >
        {label}
      </div>
      <div
        className={[
          "font-serif mt-2 leading-none stat tabular-nums",
          "text-[36px] md:text-[44px] lg:text-[48px]",
          accent ? "text-white" : "text-ink",
        ].join(" ")}
      >
        {value}
      </div>
      {sub && (
        <div
          className={[
            "mt-2 text-[13px]",
            accent ? "text-white/80" : "text-[var(--muted)]",
          ].join(" ")}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
