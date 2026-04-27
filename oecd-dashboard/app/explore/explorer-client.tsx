"use client";

import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/card";
import { BarList } from "@/components/bar-list";
import { TimeSeriesChart } from "@/components/timeseries-chart";
import { TrustBadge } from "@/components/trust-badge";
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
        const key = (r[dim] as string | null) ?? " ";
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

      {/* Summary line + auto-generated scaffold */}
      <Card padded>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
          <SummaryStat
            label="Disbursement"
            value={formatUSD(totals.v)}
            sub={
              activeCount === 0
                ? "All filters cleared"
                : `${pct(totals.v, summary.total_disbursement_usd_mn)} of dataset`
            }
            accent
            trustTier={totals.n < 50 ? "C" : "B"}
          />
          <SummaryStat
            label="Grants"
            value={formatNumber(totals.n)}
            sub={`${pct(totals.n, summary.rows)} of dataset`}
            trustTier={totals.n < 50 ? "C" : "B"}
          />
          <SummaryStat
            label="Donor countries"
            value={formatNumber(byDonorCountry.length)}
            trustTier="B"
          />
          <SummaryStat
            label="Sectors"
            value={formatNumber(bySector.length)}
            trustTier="B"
          />
        </div>
        <BriefSnippet
          totals={totals}
          activeCount={activeCount}
          filters={filters}
          byDonorCountry={byDonorCountry}
          byRegion={byRegion}
          bySector={bySector}
          byYear={byYear}
        />
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
                    .filter((r) => r.label !== " " && /^\d+$/.test(r.label))
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
           . {selected.size} selected
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
  trustTier = "B",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  trustTier?: "A" | "B" | "C";
}) {
  return (
    <div>
      <div
        className={[
          "font-mono text-[10px] tracking-[0.18em] uppercase flex items-center gap-1.5",
          accent ? "text-[var(--accent)]" : "text-[var(--muted)]",
        ].join(" ")}
      >
        <span>{label}</span>
        <TrustBadge tier={trustTier} />
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

/**
 * Auto-generated brief snippet. the scaffold that drives the parliamentary-
 * question demo scenario. Re-renders on every filter change.
 */
function BriefSnippet({
  totals,
  activeCount,
  filters,
  byDonorCountry,
  byRegion,
  bySector,
  byYear,
}: {
  totals: { v: number; n: number };
  activeCount: number;
  filters: Record<Dim, Set<string>>;
  byDonorCountry: { label: string; v: number; n: number }[];
  byRegion: { label: string; v: number; n: number }[];
  bySector: { label: string; v: number; n: number }[];
  byYear: { label: string; v: number; n: number }[];
}) {
  if (activeCount === 0) {
    return (
      <div className="border-t border-[var(--border)] pt-5 text-[13px] text-[var(--muted)] italic">
        Apply at least one filter to generate a draft brief snippet for the active
        slice. The scaffold updates as you filter.
      </div>
    );
  }

  const small = totals.n < 50;
  const topDonor = byDonorCountry[0];
  const topRegion = byRegion[0];
  const topSector = bySector[0];

  // Year trend (only if 2+ years selected or no year filter)
  const sortedYears = byYear
    .filter((y) => /^\d+$/.test(y.label))
    .sort((a, b) => Number(a.label) - Number(b.label));
  const yoyHint =
    sortedYears.length >= 2
      ? (() => {
          const first = sortedYears[0].v;
          const last = sortedYears[sortedYears.length - 1].v;
          if (first <= 0) return null;
          const pctChange = ((last - first) / first) * 100;
          return {
            firstYear: sortedYears[0].label,
            lastYear: sortedYears[sortedYears.length - 1].label,
            pctChange,
          };
        })()
      : null;

  // Build a one-line slice description from the active filters
  const sliceParts: string[] = [];
  if (filters.s.size) sliceParts.push(Array.from(filters.s).join(" / "));
  if (filters.rm.size) sliceParts.push(`in ${Array.from(filters.rm).join(", ")}`);
  if (filters.dc.size) sliceParts.push(`from donors based in ${Array.from(filters.dc).join(", ")}`);
  if (filters.y.size) sliceParts.push(`during ${Array.from(filters.y).sort().join(", ")}`);
  const sliceDesc = sliceParts.join(" ") || "the selected slice";

  return (
    <div className="border-t border-[var(--border)] pt-5">
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--accent)] mb-2 flex items-center gap-2">
        <span>Draft brief snippet</span>
        <TrustBadge tier={small ? "C" : "B"} />
        <button
          type="button"
          onClick={() => {
            const text = renderPlainText({ totals, sliceDesc, topDonor, topRegion, topSector, yoyHint, small });
            navigator.clipboard.writeText(text).catch(() => {});
          }}
          className="ml-auto text-[10px] uppercase tracking-wider text-[var(--primary)] hover:underline"
        >
          Copy
        </button>
      </div>
      <p className="font-serif text-[16px] md:text-[18px] leading-snug text-ink mb-3">
        Across 2020 to 2023, {sliceDesc} accounted for{" "}
        <strong className="text-[var(--primary)]">{formatUSD(totals.v)}</strong> in
        philanthropic disbursement across {formatNumber(totals.n)} grants.
      </p>
      <ul className="text-[13px] text-[var(--muted)] leading-relaxed space-y-1.5">
        {topDonor && (
          <li>
            • Largest donor home country: <strong className="text-ink">{topDonor.label}</strong>{" "}
            ({formatUSD(topDonor.v)}, {formatNumber(topDonor.n)} grants).
          </li>
        )}
        {topRegion && (
          <li>
            • Largest recipient region: <strong className="text-ink">{topRegion.label}</strong>{" "}
            ({formatUSD(topRegion.v)}).
          </li>
        )}
        {topSector && (
          <li>
            • Dominant sector in the slice: <strong className="text-ink">{topSector.label}</strong>{" "}
            ({formatUSD(topSector.v)}).
          </li>
        )}
        {yoyHint && (
          <li>
            • From {yoyHint.firstYear} to {yoyHint.lastYear}, disbursement{" "}
            {yoyHint.pctChange >= 0 ? "rose" : "fell"} by{" "}
            <strong className="text-ink">{Math.abs(yoyHint.pctChange).toFixed(0)}%</strong>
            {Math.abs(yoyHint.pctChange) < 25 && ". directional only, magnitude is below the significance threshold"}
            .
          </li>
        )}
      </ul>
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--forest)] mb-1.5">
          For a foundation strategist
        </div>
        <p className="text-[13px] text-[var(--muted)] italic leading-relaxed">
          This slice shows where the field has already concentrated. To evaluate
          differentiation, compare the dominant sector and donor against your
          own portfolio mix.
        </p>
      </div>
      {small && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--alert)] mb-1.5">
            Caveat
          </div>
          <p className="text-[13px] text-[var(--muted)] leading-relaxed">
            Slice contains fewer than 50 grants. figures are directional only,
            not authoritative. Trend claims should not be drawn from this size of
            sample.
          </p>
        </div>
      )}
    </div>
  );
}

function renderPlainText({ totals, sliceDesc, topDonor, topRegion, topSector, yoyHint, small }: {
  totals: { v: number; n: number };
  sliceDesc: string;
  topDonor?: { label: string; v: number; n: number };
  topRegion?: { label: string; v: number; n: number };
  topSector?: { label: string; v: number; n: number };
  yoyHint: { firstYear: string; lastYear: string; pctChange: number } | null;
  small: boolean;
}): string {
  const lines = [
    `Across 2020-2023, ${sliceDesc} accounted for ${formatUSD(totals.v)} in philanthropic disbursement across ${formatNumber(totals.n)} grants.`,
  ];
  if (topDonor) lines.push(`- Largest donor home country: ${topDonor.label} (${formatUSD(topDonor.v)}, ${topDonor.n} grants).`);
  if (topRegion) lines.push(`- Largest recipient region: ${topRegion.label} (${formatUSD(topRegion.v)}).`);
  if (topSector) lines.push(`- Dominant sector: ${topSector.label} (${formatUSD(topSector.v)}).`);
  if (yoyHint) lines.push(`- From ${yoyHint.firstYear} to ${yoyHint.lastYear}, disbursement ${yoyHint.pctChange >= 0 ? "rose" : "fell"} by ${Math.abs(yoyHint.pctChange).toFixed(0)}%.`);
  if (small) lines.push(`Caveat: slice contains fewer than 50 grants; figures are directional only.`);
  lines.push(`Source: OECD philanthropy database 2020-2023.`);
  return lines.join("\n");
}

function Empty() {
  return (
    <div className="text-[14px] text-[var(--muted)] py-8 text-center italic">
      No grants match the current filters.
    </div>
  );
}
