"use client";

import { useMemo, useState } from "react";
import { PlotlyMisalignment } from "./plotly-misalignment";
import type { WorldMisalignmentRow } from "@/lib/data";

/**
 * Client-side wrapper for the goal-alignment chart and its matching table.
 * Both views share one sort state so the user always sees the same ordering
 * in both places.
 *
 * Sort options:
 *  - SDG goal number (default)
 *  - Dollar share
 *  - Need share
 *  - Delta percentage points
 * Plus an ascending / descending toggle.
 */

type SortKey = "goal" | "phil_share_pct" | "need_share_pct" | "delta_pp";

const SORT_OPTIONS: { id: SortKey; label: string; defaultDir: "asc" | "desc" }[] = [
  { id: "goal", label: "SDG goal number", defaultDir: "asc" },
  { id: "phil_share_pct", label: "Dollar share", defaultDir: "desc" },
  { id: "need_share_pct", label: "Need share", defaultDir: "desc" },
  { id: "delta_pp", label: "Δ percentage points", defaultDir: "desc" },
];

export function SdgMisalignmentSection({
  rows,
}: {
  rows: WorldMisalignmentRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("goal");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  function pickSort(next: SortKey) {
    if (next === sortKey) {
      // toggle direction when clicking the active option
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(next);
      const opt = SORT_OPTIONS.find((o) => o.id === next);
      setSortDir(opt?.defaultDir ?? "asc");
    }
  }

  const activeOption = SORT_OPTIONS.find((o) => o.id === sortKey)!;

  return (
    <div>
      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-[var(--border)]">
        <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--accent)] mr-1">
          Sort by
        </span>
        <div
          className="flex flex-wrap gap-1.5 rounded-full bg-[var(--paper)] border border-[var(--border)] p-1"
          role="tablist"
          aria-label="Sort goal alignment data"
        >
          {SORT_OPTIONS.map((opt) => {
            const active = opt.id === sortKey;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => pickSort(opt.id)}
                className={[
                  "text-[13px] px-3 py-1 rounded-full transition-all",
                  active
                    ? "bg-[var(--primary)] text-white font-medium"
                    : "text-[var(--muted)] hover:text-ink hover:bg-white",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="inline-flex items-center gap-2 text-[13px] px-3 py-1 rounded-full border border-[var(--border-strong)] text-ink hover:bg-[var(--paper)] transition-colors"
          title={
            sortDir === "asc"
              ? "Currently ascending. Click for descending."
              : "Currently descending. Click for ascending."
          }
          aria-label={`Toggle direction. Currently ${sortDir}`}
        >
          <span aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>
          <span>{sortDir === "asc" ? "Ascending" : "Descending"}</span>
        </button>
        <span className="ml-auto text-[12px] text-[var(--muted)]">
          Showing {rows.length} goals, sorted by{" "}
          <strong className="text-ink">{activeOption.label.toLowerCase()}</strong>{" "}
          ({sortDir})
        </span>
      </div>

      {/* Chart. Plotly bars render top-to-bottom in array order (with reverseY=false) */}
      <PlotlyMisalignment rows={sorted} reverseY={false} />

      {/* Table mirrors the same sorted data */}
      <table className="w-full mt-6 text-[14px] border-t border-[var(--border)]">
        <thead className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
          <tr>
            <th className="text-left font-normal py-2 pr-2">Goal</th>
            <th className="text-right font-normal py-2 px-2">$ share</th>
            <th className="text-right font-normal py-2 px-2">Need share</th>
            <th className="text-right font-normal py-2 pl-2">Δ pp</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.goal} className="border-t border-[var(--border)]">
              <td className="py-1.5 pr-2 text-ink">
                <span className="font-mono text-[var(--subtle)] mr-2">
                  {r.goal}
                </span>
                {r.name}
              </td>
              <td className="py-1.5 px-2 text-right font-mono tabular-nums text-[var(--muted)]">
                {r.phil_share_pct.toFixed(1)}%
              </td>
              <td className="py-1.5 px-2 text-right font-mono tabular-nums text-[var(--muted)]">
                {r.need_share_pct.toFixed(1)}%
              </td>
              <td
                className={[
                  "py-1.5 pl-2 text-right font-mono tabular-nums",
                  r.delta_pp >= 2
                    ? "text-[var(--accent)]"
                    : r.delta_pp <= -2
                      ? "text-[var(--alert)]"
                      : "text-[var(--subtle)]",
                ].join(" ")}
              >
                {r.delta_pp >= 0 ? "+" : ""}
                {r.delta_pp.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
