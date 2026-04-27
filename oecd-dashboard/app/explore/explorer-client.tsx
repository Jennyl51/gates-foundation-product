"use client";

import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/card";
import { BarList } from "@/components/bar-list";
import { TimeSeriesChart } from "@/components/timeseries-chart";
import { formatUSD, formatNumber, pct } from "@/lib/format";
import type { ExplorerRow, Summary } from "@/lib/data";

type Dim = "y" | "dc" | "rm" | "s";

const DIM_LABELS: Record<Dim, string> = {
  y: "Year",
  dc: "Donor country",
  rm: "Recipient region",
  s: "Sector",
};

export function ExplorerClient({
  rows,
  summary,
}: {
  rows: ExplorerRow[];
  summary: Summary;
}) {
  // domain values for each dimension
  const domains = useMemo(() => {
    const out: Record<Dim, string[]> = { y: [], dc: [], rm: [], s: [] };
    const sets: Record<Dim, Set<string>> = {
      y: new Set(),
      dc: new Set(),
      rm: new Set(),
      s: new Set(),
    };
    for (const r of rows) {
      if (r.y) sets.y.add(r.y);
      if (r.dc) sets.dc.add(r.dc);
      if (r.rm) sets.rm.add(r.rm);
      if (r.s) sets.s.add(r.s);
    }
    out.y = Array.from(sets.y).sort();
    out.dc = Array.from(sets.dc).sort();
    out.rm = Array.from(sets.rm).sort();
    out.s = Array.from(sets.s).sort();
    return out;
  }, [rows]);

  const [filters, setFilters] = useState<Record<Dim, Set<string>>>({
    y: new Set(),
    dc: new Set(),
    rm: new Set(),
    s: new Set(),
  });

  const toggle = (dim: Dim, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [dim]: new Set(prev[dim]) };
      if (next[dim].has(value)) next[dim].delete(value);
      else next[dim].add(value);
      return next;
    });
  };

  const clearAll = () =>
    setFilters({ y: new Set(), dc: new Set(), rm: new Set(), s: new Set() });

  const activeCount =
    filters.y.size + filters.dc.size + filters.rm.size + filters.s.size;

  // filter rows
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.y.size && (!r.y || !filters.y.has(r.y))) return false;
      if (filters.dc.size && (!r.dc || !filters.dc.has(r.dc))) return false;
      if (filters.rm.size && (!r.rm || !filters.rm.has(r.rm))) return false;
      if (filters.s.size && (!r.s || !filters.s.has(r.s))) return false;
      return true;
    });
  }, [rows, filters]);

  const totals = useMemo(() => {
    let v = 0;
    let n = 0;
    for (const r of filtered) {
      v += r.v;
      n += r.n;
    }
    return { v, n };
  }, [filtered]);

  const aggregateBy = useCallback(
    (dim: Dim) => {
      const m = new Map<string, { v: number; n: number }>();
      for (const r of filtered) {
        const key = (r[dim] as string | null) ?? "—";
        const cur = m.get(key) ?? { v: 0, n: 0 };
        cur.v += r.v;
        cur.n += r.n;
        m.set(key, cur);
      }
      return Array.from(m.entries())
        .map(([k, vals]) => ({ label: k, ...vals }))
        .sort((a, b) => b.v - a.v);
    },
    [filtered]
  );

  const byYear = useMemo(() => aggregateBy("y"), [aggregateBy]);
  const byDonorCountry = useMemo(() => aggregateBy("dc"), [aggregateBy]);
  const byRegion = useMemo(() => aggregateBy("rm"), [aggregateBy]);
  const bySector = useMemo(() => aggregateBy("s"), [aggregateBy]);

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <Card padded>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-[18px] text-ink">Filters</h3>
          <button
            type="button"
            onClick={clearAll}
            className="text-[12px] text-[var(--muted)] hover:text-ink underline-offset-2 hover:underline disabled:opacity-40 disabled:no-underline"
            disabled={activeCount === 0}
          >
            Clear all {activeCount > 0 ? `(${activeCount})` : ""}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(["y", "dc", "rm", "s"] as Dim[]).map((dim) => (
            <FilterGroup
              key={dim}
              label={DIM_LABELS[dim]}
              values={domains[dim]}
              selected={filters[dim]}
              onToggle={(v) => toggle(dim, v)}
            />
          ))}
        </div>
      </Card>

      {/* Summary line */}
      <Card padded>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <SummaryStat
            label="Disbursement"
            value={formatUSD(totals.v)}
            sub={
              activeCount === 0
                ? "All filters cleared"
                : `${pct(totals.v, summary.total_disbursement_usd_mn)} of dataset`
            }
            accent
          />
          <SummaryStat
            label="Grants"
            value={formatNumber(totals.n)}
            sub={`${pct(totals.n, summary.rows)} of dataset`}
          />
          <SummaryStat
            label="Donor countries"
            value={formatNumber(byDonorCountry.length)}
          />
          <SummaryStat label="Sectors" value={formatNumber(bySector.length)} />
        </div>
      </Card>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="By year">
          {byYear.length > 0 ? (
            <TimeSeriesChart
              series={[
                {
                  name: "Disbursement",
                  data: byYear
                    .filter((r) => r.label !== "—" && /^\d+$/.test(r.label))
                    .sort((a, b) => Number(a.label) - Number(b.label))
                    .map((r) => ({ x: Number(r.label), y: r.v })),
                },
              ]}
            />
          ) : (
            <Empty />
          )}
        </Card>
        <Card title="By recipient region">
          <BarList
            items={byRegion.map((r) => ({
              label: r.label,
              value: r.v,
              sub: `${formatNumber(r.n)} grants`,
            }))}
            accent="accent"
          />
        </Card>
        <Card title="Top donor countries">
          <BarList
            items={byDonorCountry.slice(0, 12).map((r) => ({
              label: r.label,
              value: r.v,
              sub: `${formatNumber(r.n)} grants`,
            }))}
            accent="primary"
          />
        </Card>
        <Card title="Top sectors">
          <BarList
            items={bySector.slice(0, 12).map((r) => ({
              label: r.label,
              value: r.v,
              sub: `${formatNumber(r.n)} grants`,
            }))}
            accent="forest"
          />
        </Card>
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="text-[var(--muted)]">Active filters:</span>
          {(["y", "dc", "rm", "s"] as Dim[]).flatMap((dim) =>
            Array.from(filters[dim]).map((value) => (
              <button
                key={`${dim}:${value}`}
                type="button"
                onClick={() => toggle(dim, value)}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-[3px] rounded-full bg-[var(--primary-soft)] text-[var(--primary-deep)] hover:bg-[var(--accent-soft)] hover:text-[var(--alert)] transition-colors"
                title={`Remove ${DIM_LABELS[dim]}: ${value}`}
              >
                <span className="font-mono uppercase tracking-wider text-[10px] opacity-60">
                  {DIM_LABELS[dim]}
                </span>
                <span>{value}</span>
                <span className="text-[14px] leading-none ml-0.5">×</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--accent)] mb-2">
        {label}
        {selected.size > 0 && (
          <span className="ml-2 text-[var(--muted)] normal-case tracking-normal">
            · {selected.size} selected
          </span>
        )}
      </div>
      <div className="max-h-[160px] overflow-y-auto scroll-hide pr-1 space-y-0.5">
        {values.map((v) => {
          const active = selected.has(v);
          return (
            <button
              key={v}
              type="button"
              onClick={() => onToggle(v)}
              className={[
                "w-full text-left text-[13px] px-2 py-1 rounded-sm transition-colors",
                active
                  ? "bg-[var(--primary)] text-white"
                  : "hover:bg-black/[0.04] text-ink",
              ].join(" ")}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className={[
                    "w-3 h-3 rounded-sm border",
                    active
                      ? "bg-white border-white"
                      : "border-[var(--border-strong)] bg-transparent",
                  ].join(" ")}
                  aria-hidden
                >
                  {active && (
                    <svg
                      viewBox="0 0 12 12"
                      className="w-3 h-3 text-[var(--primary)]"
                    >
                      <path
                        d="M2.5 6 L5 8.5 L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="truncate">{v}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        className={[
          "font-mono text-[10px] tracking-[0.18em] uppercase",
          accent ? "text-[var(--accent)]" : "text-[var(--muted)]",
        ].join(" ")}
      >
        {label}
      </div>
      <div
        className={[
          "font-serif tabular-nums leading-tight mt-1",
          "text-[26px] md:text-[30px]",
          accent ? "text-[var(--primary)]" : "text-ink",
        ].join(" ")}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[12px] text-[var(--subtle)]">{sub}</div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="text-[14px] text-[var(--muted)] py-8 text-center italic">
      No grants match the current filters.
    </div>
  );
}
