"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { KPI } from "@/components/scaffold";
import type { KpiHighlights } from "@/lib/data";

type KpiId = "disbursed" | "foundations" | "recipients" | "cross_border";

type KpiItem = {
  id: KpiId;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  trustTier?: "A" | "B" | "C";
  /** Visual hint for the active KPI tile. The KpiSelector also forces accent
   *  on whichever item is currently selected, so this is a default state. */
  accent?: boolean;
};

export function KpiSelector({
  items,
  highlights,
}: {
  items: KpiItem[];
  highlights: KpiHighlights;
}) {
  const [activeId, setActiveId] = useState<KpiId>("disbursed");
  const active = highlights[activeId];

  return (
    <div className="mt-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {items.map((item) => {
          const selected = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              aria-pressed={selected}
              className={[
                "text-left rounded-md transition-all duration-200",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                selected
                  ? "shadow-sm"
                  : "hover:-translate-y-0.5 hover:shadow-sm [&>div]:hover:bg-[var(--primary-soft)]",
              ].join(" ")}
            >
              <KPI
                label={item.label}
                value={item.value}
                sub={item.sub}
                trustTier={item.trustTier}
                accent={selected}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--accent)] mb-2">
      {items.find((i) => i.id === activeId)?.label} · INSIGHTS
    </div>

        <h2 className="font-serif text-[22px] text-ink">
          {active.title}
        </h2>

        {active.stats?.length ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {active.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border border-[var(--border)] bg-[var(--paper)] p-3"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--subtle)]">
                  {stat.label}
                </div>

                <div className="mt-1 font-serif text-[22px] text-[var(--primary)]">
                    {stat.value}
                    {stat.unit && (
                        <span className="ml-1 text-[12px] text-[var(--muted)] font-mono">
                        {stat.unit}
                        </span>
                    )}
                </div>

                {stat.note && (
                  <p className="mt-1 text-[12px] text-[var(--muted)]">
                    {stat.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : null}

        <ul className="mt-4 space-y-2 text-[14px] md:text-[15px] text-[var(--muted)] leading-relaxed">
          {active.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {active.table?.length ? (
          <div className="mt-5 overflow-hidden rounded-md border border-[var(--border)]">
            {active.table.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_auto] gap-4 border-b border-[var(--border)] last:border-b-0 px-4 py-3 text-[14px]"
              >
                <div>
                  <div className="font-medium text-ink">{row.label}</div>
                  {row.note && (
                    <div className="text-[12px] text-[var(--muted)]">
                      {row.note}
                    </div>
                  )}
                </div>
                <div className="font-mono text-[var(--primary)]">
                    {row.value}
                    {row.unit && (
                        <span className="ml-1 text-[11px] text-[var(--muted)]">
                        {row.unit}
                        </span>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}