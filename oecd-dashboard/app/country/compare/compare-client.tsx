"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, Pill } from "@/components/card";
import { TrustBadge, TrustLegend } from "@/components/trust-badge";
import { formatNumber, formatUSD } from "@/lib/format";
import type { CountryProfileV3 } from "@/lib/data";

type CountryListItem = {
  slug: string;
  country: string;
  total: number;
  isDac: boolean;
};

export function CompareClient({ countries }: { countries: CountryListItem[] }) {
  // Default to two large, contrasting profiles if available
  const defaultA =
    countries.find((c) => c.slug === "united-states")?.slug ??
    countries[0]?.slug ??
    "";
  const defaultB =
    countries.find((c) => c.slug === "mexico")?.slug ??
    countries[1]?.slug ??
    "";

  const [aSlug, setASlug] = useState(defaultA);
  const [bSlug, setBSlug] = useState(defaultB);
  const [a, setA] = useState<CountryProfileV3 | null>(null);
  const [b, setB] = useState<CountryProfileV3 | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!aSlug || !bSlug) return;
      setLoading(true);
      try {
        const [aRes, bRes] = await Promise.all([
          fetch(`/data/countries/${aSlug}.json`),
          fetch(`/data/countries/${bSlug}.json`),
        ]);
        const aData = (await aRes.json()) as CountryProfileV3;
        const bData = (await bRes.json()) as CountryProfileV3;
        if (!cancelled) {
          setA(aData);
          setB(bData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [aSlug, bSlug]);

  function swap() {
    setASlug(bSlug);
    setBSlug(aSlug);
  }

  const sectorDeltas = useMemo(() => {
    if (!a || !b) return [];
    const aMap = new Map(a.top_sectors.map((s) => [s.sector, s.share_pct]));
    const bMap = new Map(b.top_sectors.map((s) => [s.sector, s.share_pct]));
    const allSectors = new Set([...aMap.keys(), ...bMap.keys()]);
    return Array.from(allSectors)
      .map((sector) => {
        const av = aMap.get(sector) ?? 0;
        const bv = bMap.get(sector) ?? 0;
        return { sector, a: av, b: bv, delta: av - bv };
      })
      .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
      .slice(0, 8);
  }, [a, b]);

  const sharedRecipients = useMemo(() => {
    if (!a || !b) return [];
    const aSet = new Set(a.top_recipients.map((r) => r.country));
    const bSet = new Set(b.top_recipients.map((r) => r.country));
    return Array.from(aSet).filter((c) => bSet.has(c));
  }, [a, b]);

  return (
    <div className="space-y-6">
      {/* Picker bar */}
      <Card padded>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <Picker label="Country A" value={aSlug} onChange={setASlug} options={countries} />
          <button
            type="button"
            onClick={swap}
            aria-label="Swap A and B"
            className="h-10 px-3 rounded-full border border-[var(--border-strong)] text-ink hover:bg-[var(--paper)] transition-colors text-[13px] font-mono"
            title="Swap A and B"
          >
            ⇄ Swap
          </button>
          <Picker label="Country B" value={bSlug} onChange={setBSlug} options={countries} />
        </div>
        <div className="mt-3"><TrustLegend /></div>
      </Card>

      {loading || !a || !b ? (
        <Card padded>
          <p className="text-[14px] text-[var(--muted)] italic">
            {loading ? "Loading both profiles…" : "Pick two countries above."}
          </p>
        </Card>
      ) : (
        <>
          {/* Auto-generated comparison statement */}
          <Card padded className="border-2 border-[var(--primary)] bg-[var(--primary-soft)]/30">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--primary-deep)] mb-2">
              At a glance
            </div>
            <p className="font-serif text-[18px] md:text-[20px] leading-relaxed text-ink">
              {generateComparisonStatement(a, b, sharedRecipients.length)}
            </p>
          </Card>

          {/* Headline metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <MetricRow
              label="Total disbursement"
              a={formatUSD(a.total_disbursement_usd_mn)}
              b={formatUSD(b.total_disbursement_usd_mn)}
              aRaw={a.total_disbursement_usd_mn}
              bRaw={b.total_disbursement_usd_mn}
              countryA={a.country}
              countryB={b.country}
              unit="USD"
            />
            <MetricRow
              label="Foundations represented"
              a={formatNumber(a.n_foundations)}
              b={formatNumber(b.n_foundations)}
              aRaw={a.n_foundations}
              bRaw={b.n_foundations}
              countryA={a.country}
              countryB={b.country}
              unit="count"
            />
            <MetricRow
              label="Cross-border share"
              a={`${a.cross_border_share_pct.toFixed(0)}%`}
              b={`${b.cross_border_share_pct.toFixed(0)}%`}
              aRaw={a.cross_border_share_pct}
              bRaw={b.cross_border_share_pct}
              countryA={a.country}
              countryB={b.country}
              unit="pct"
            />
          </div>

          {/* Sector comparison table */}
          <Card title="Sector mix comparison" description="Eight sectors with the largest difference between the two countries (in percentage points).">
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left font-normal py-2 pr-3">Sector</th>
                    <th className="text-right font-normal py-2 px-3">{a.country}</th>
                    <th className="text-right font-normal py-2 px-3">{b.country}</th>
                    <th className="text-right font-normal py-2 pl-3">Difference (pp)</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorDeltas.map((row) => {
                    const positive = row.delta > 0;
                    return (
                      <tr key={row.sector} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-3 text-ink">{row.sector}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-[var(--muted)]">
                          {row.a.toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-[var(--muted)]">
                          {row.b.toFixed(1)}%
                        </td>
                        <td
                          className={[
                            "py-2 pl-3 text-right font-mono tabular-nums font-medium",
                            positive ? "text-[var(--primary)]" : "text-[var(--alert)]",
                          ].join(" ")}
                          title={positive ? `${a.country} spends more` : `${b.country} spends more`}
                        >
                          {positive ? "+" : ""}{row.delta.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-[var(--muted)] mt-3">
              Positive values mean {a.country} over-allocates to that sector relative to {b.country}.
            </p>
          </Card>

          {/* Shared recipients */}
          <Card title="Shared top recipient countries" description={`${sharedRecipients.length} of the top recipients overlap between the two profiles.`}>
            {sharedRecipients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {sharedRecipients.map((c) => (
                  <Pill key={c} tone="primary">{c}</Pill>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-[var(--muted)] italic">
                The two countries do not share any top-15 recipient destinations. They likely operate in different regions or with different cause areas.
              </p>
            )}
          </Card>

          {/* Drill-down links */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/country/${a.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[var(--primary)] text-[var(--primary-deep)] text-[14px] font-medium hover:bg-[var(--primary-soft)] transition-colors"
            >
              Full {a.country} profile →
            </Link>
            <Link
              href={`/country/${b.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[var(--primary)] text-[var(--primary-deep)] text-[14px] font-medium hover:bg-[var(--primary-soft)] transition-colors"
            >
              Full {b.country} profile →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function Picker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (slug: string) => void;
  options: CountryListItem[];
}) {
  return (
    <label className="block">
      <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--accent)] mb-1.5">
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 text-[14px] rounded-md border border-[var(--border-strong)] bg-white text-ink focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
      >
        {options.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.country}
            {c.isDac ? " (DAC)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetricRow({
  label,
  a,
  b,
  aRaw,
  bRaw,
  countryA,
  countryB,
  unit,
}: {
  label: string;
  a: string;
  b: string;
  aRaw: number;
  bRaw: number;
  countryA: string;
  countryB: string;
  unit: "USD" | "pct" | "count";
}) {
  const aLarger = aRaw > bRaw;
  const ratio = bRaw === 0 ? Infinity : aRaw / bRaw;
  let comparison = "";
  if (Math.abs(aRaw - bRaw) < 0.001) {
    comparison = "Roughly equal";
  } else if (unit === "pct") {
    comparison = `${aLarger ? countryA : countryB} is ${Math.abs(aRaw - bRaw).toFixed(0)} pp higher`;
  } else if (ratio === Infinity || ratio < 0.001) {
    comparison = `${aLarger ? countryA : countryB} dominates`;
  } else {
    const factor = aLarger ? aRaw / bRaw : bRaw / aRaw;
    comparison = `${aLarger ? countryA : countryB} is ${factor.toFixed(1)}x larger`;
  }

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--accent)] mb-3 flex items-center gap-2">
        <span>{label}</span>
        <TrustBadge tier="B" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-[11px] text-[var(--muted)] mb-0.5">{countryA}</div>
          <div className="font-serif text-[24px] tabular-nums text-ink">{a}</div>
        </div>
        <div>
          <div className="text-[11px] text-[var(--muted)] mb-0.5">{countryB}</div>
          <div className="font-serif text-[24px] tabular-nums text-ink">{b}</div>
        </div>
      </div>
      <div className="text-[12px] text-[var(--primary-deep)] pt-2 border-t border-[var(--border)]">
        {comparison}
      </div>
    </div>
  );
}

function generateComparisonStatement(
  a: CountryProfileV3,
  b: CountryProfileV3,
  sharedCount: number
): string {
  const aDom = a.cross_border_share_pct < 50;
  const bDom = b.cross_border_share_pct < 50;
  const flowFrame =
    aDom === bDom
      ? aDom
        ? `Both countries are predominantly domestic givers.`
        : `Both countries are cross-border givers.`
      : `${aDom ? a.country : b.country} is mostly a domestic giver while ${aDom ? b.country : a.country} is mostly cross-border.`;

  const ratio = b.total_disbursement_usd_mn === 0 ? Infinity : a.total_disbursement_usd_mn / b.total_disbursement_usd_mn;
  let scaleFrame: string;
  if (Math.abs(a.total_disbursement_usd_mn - b.total_disbursement_usd_mn) / Math.max(a.total_disbursement_usd_mn, b.total_disbursement_usd_mn) < 0.2) {
    scaleFrame = `The two profiles are roughly the same size.`;
  } else if (ratio > 1) {
    scaleFrame = `${a.country} is ${ratio.toFixed(1)} times larger by disbursement than ${b.country}.`;
  } else {
    scaleFrame = `${b.country} is ${(1 / ratio).toFixed(1)} times larger by disbursement than ${a.country}.`;
  }

  const aTopSector = a.top_sectors[0]?.sector ?? "—";
  const bTopSector = b.top_sectors[0]?.sector ?? "—";
  const sectorFrame =
    aTopSector === bTopSector
      ? `Both lead with ${aTopSector}.`
      : `${a.country} leads with ${aTopSector}; ${b.country} leads with ${bTopSector}.`;

  const overlapFrame =
    sharedCount > 0
      ? `${sharedCount} top recipient countries appear in both profiles.`
      : `No top-recipient overlap.`;

  return `${scaleFrame} ${flowFrame} ${sectorFrame} ${overlapFrame}`;
}
