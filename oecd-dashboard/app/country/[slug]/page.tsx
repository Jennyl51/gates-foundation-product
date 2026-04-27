import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/section";
import { Scaffold, KPI } from "@/components/scaffold";
import { Card, Pill } from "@/components/card";
import { BarList } from "@/components/bar-list";
import { TimeSeriesChart } from "@/components/timeseries-chart";
import { loadCountryProfile, listCountrySlugs } from "@/lib/data";
import { formatNumber, formatUSD } from "@/lib/format";

export async function generateStaticParams() {
  const slugs = await listCountrySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await loadCountryProfile(slug);
  if (!profile) return { title: "Country profile not found" };
  return { title: `${profile.country}. Country profile. OECD Decision Atlas` };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await loadCountryProfile(slug);
  if (!p) notFound();

  const trustTier = p.total_disbursement_usd_mn >= 100 ? "B" : "C";
  const peerOver = p.peer_comparison.sector_deltas.find((d) => d.delta_pp > 0);
  const peerUnder = [...p.peer_comparison.sector_deltas]
    .reverse()
    .find((d) => d.delta_pp < 0);

  return (
    <>
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-12 pb-10">
          <div className="text-[12px] text-[var(--muted)] mb-3">
            <Link href="/country" className="hover:text-ink underline-offset-4 hover:underline">
              ← All country profiles
            </Link>
          </div>
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <Pill tone="primary">Country profile</Pill>
            {p.is_dac_member && <Pill tone="forest">OECD-DAC member</Pill>}
            {trustTier === "C" && <Pill tone="accent">Directional only</Pill>}
          </div>
          <h1 className="font-serif text-[34px] md:text-[48px] leading-[1.1] tracking-tight text-ink">
            {p.country}
          </h1>
          <p className="mt-4 text-[15px] md:text-[17px] text-[var(--muted)] leading-relaxed max-w-2xl">
            {p.cross_border_share_pct >= 95
              ? `Almost all of ${p.country}'s ${formatUSD(p.total_disbursement_usd_mn)} in tracked private philanthropy crosses borders. this country is a net donor to the rest of the world.`
              : p.domestic_share_pct >= 95
                ? `Almost all of ${p.country}'s ${formatUSD(p.total_disbursement_usd_mn)} in tracked private philanthropy stays inside the country. this is domestic philanthropy.`
                : `${p.country}'s ${formatUSD(p.total_disbursement_usd_mn)} in tracked private philanthropy splits roughly ${p.cross_border_share_pct.toFixed(0)}% cross-border / ${p.domestic_share_pct.toFixed(0)}% domestic.`}
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <KPI
              label="Disbursed"
              value={formatUSD(p.total_disbursement_usd_mn)}
              sub={`${formatNumber(p.n_grants)} grants`}
              accent
              trustTier={trustTier}
            />
            <KPI
              label="Foundations"
              value={formatNumber(p.n_foundations)}
              sub="distinct donor orgs"
              trustTier={trustTier}
            />
            <KPI
              label="Cross-border"
              value={`${p.cross_border_share_pct.toFixed(0)}%`}
              sub={`${p.domestic_share_pct.toFixed(0)}% domestic`}
              trustTier={trustTier}
            />
            <KPI
              label="Top sector"
              value={p.top_sectors[0]?.share_pct.toFixed(0) + "%" || " "}
              sub={p.top_sectors[0]?.sector ?? ""}
              trustTier={trustTier}
            />
          </div>
        </div>
      </section>

      {/* Peer comparison scaffold */}
      <Section eyebrow="Diagnosis. Peer comparison" title={`${p.country} vs OECD-DAC average`}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <Card
            title="Sector mix versus DAC average"
            description="Largest deviations shown first. Positive = over-allocated relative to peers."
          >
            <div className="space-y-2.5">
              {p.peer_comparison.sector_deltas.slice(0, 8).map((d) => (
                <DeltaRow key={d.label} d={d} />
              ))}
            </div>
            {p.peer_comparison.region_deltas.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[var(--border)]">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)] mb-3">
                  Regional mix vs DAC
                </div>
                <div className="space-y-2.5">
                  {p.peer_comparison.region_deltas.slice(0, 5).map((d) => (
                    <DeltaRow key={d.label} d={d} />
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Scaffold
            eyebrow={p.is_dac_member ? "Draft for DAC peer review" : "Profile (non-DAC reference)"}
            trustTier={trustTier}
            claim={
              peerOver && peerUnder ? (
                <>
                  {p.country} over-allocates to{" "}
                  <span className="text-[var(--primary)]">
                    {peerOver.label.toLowerCase()} ({peerOver.delta_pp >= 0 ? "+" : ""}
                    {peerOver.delta_pp.toFixed(1)} pp)
                  </span>{" "}
                  and under-allocates to{" "}
                  <span className="text-[var(--alert)]">
                    {peerUnder.label.toLowerCase()} ({peerUnder.delta_pp.toFixed(1)} pp)
                  </span>{" "}
                  relative to the OECD-DAC average.
                </>
              ) : (
                <>
                  {p.country}&rsquo;s sector mix tracks the OECD-DAC average within
                  the noise of a small dataset.
                </>
              )
            }
            evidence={[
              <>
                Total tracked disbursement: {formatUSD(p.total_disbursement_usd_mn)} across{" "}
                {formatNumber(p.n_grants)} grants from {formatNumber(p.n_foundations)} foundations.
              </>,
              <>
                Flow split: <strong>{p.cross_border_share_pct.toFixed(1)}%</strong> cross-border,{" "}
                <strong>{p.domestic_share_pct.toFixed(1)}%</strong> domestic.
                {p.flow_unspecified_share_pct > 5 && (
                  <> Flow unspecified on {p.flow_unspecified_share_pct.toFixed(1)}% of dollars.</>
                )}
              </>,
              <>
                Top three sectors:{" "}
                {p.top_sectors.slice(0, 3).map((s, i) => (
                  <span key={s.sector}>
                    {i > 0 && ", "}
                    <strong className="text-ink">{s.sector}</strong> ({s.share_pct.toFixed(0)}%)
                  </span>
                ))}.
              </>,
            ]}
            foundationLens={
              p.is_dac_member ? (
                <>
                  For a foundation considering co-funding, {p.country}&rsquo;s
                  pattern signals where competitors are concentrated and where the
                  field has gaps you might fill.
                </>
              ) : (
                <>
                  This country is not in the OECD-DAC peer group. Its profile is shown
                  for completeness but the comparator deltas should be read as
                  informational, not normative.
                </>
              )
            }
            caveat={p._caveat}
            source={`Source: OECD philanthropy database 2020 to 2023. peer group: ${p.peer_comparison.peer_group}`}
          />
        </div>
      </Section>

      {/* Year + recipients */}
      <Section eyebrow="Detail">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <Card title="Disbursement by year">
            {p.by_year.length > 0 ? (
              <TimeSeriesChart
                series={[
                  {
                    name: p.country,
                    data: p.by_year.map((d) => ({ x: d.year, y: d.disbursement })),
                  },
                ]}
                height={240}
              />
            ) : (
              <div className="text-[14px] text-[var(--muted)] py-6 italic">
                Year-level data unavailable for this country (NDA-aggregated reporting).
              </div>
            )}
          </Card>
          <Card title="Top recipient countries">
            {p.top_recipients.length > 0 ? (
              <BarList
                items={p.top_recipients.map((r) => ({
                  label: r.country,
                  value: r.disbursement,
                }))}
                accent="accent"
              />
            ) : (
              <div className="text-[13px] text-[var(--muted)] italic py-4">
                Recipient-country data unavailable; this country&rsquo;s grants are
                reported at regional or global aggregate level only.
              </div>
            )}
          </Card>
        </div>
      </Section>
    </>
  );
}

function DeltaRow({ d }: { d: { label: string; country_share_pct: number; dac_avg_share_pct: number; delta_pp: number } }) {
  const positive = d.delta_pp >= 0;
  const magnitude = Math.min(100, Math.abs(d.delta_pp) * 4); // visual scaling
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
      <div className="min-w-0">
        <div className="flex justify-between items-baseline text-[13px] mb-1">
          <span className="text-ink truncate">{d.label}</span>
          <span className="font-mono tabular-nums text-[var(--muted)] text-[12px] shrink-0 ml-3">
            {d.country_share_pct.toFixed(1)}% vs {d.dac_avg_share_pct.toFixed(1)}%
          </span>
        </div>
        <div className="relative h-1.5 rounded bg-[var(--border)]">
          <div
            className="absolute inset-y-0 rounded"
            style={{
              left: positive ? "50%" : `${50 - magnitude / 2}%`,
              width: `${magnitude / 2}%`,
              background: positive ? "var(--primary)" : "var(--alert)",
            }}
          />
          <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--border-strong)]" />
        </div>
      </div>
      <div
        className={[
          "font-mono tabular-nums text-[13px] w-14 text-right",
          positive ? "text-[var(--primary)]" : "text-[var(--alert)]",
        ].join(" ")}
      >
        {positive ? "+" : ""}
        {d.delta_pp.toFixed(1)}
      </div>
    </div>
  );
}
