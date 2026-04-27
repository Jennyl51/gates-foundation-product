import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/section";
import { Card, Pill } from "@/components/card";
import { BarList } from "@/components/bar-list";
import { PlotlyTimeSeries } from "@/components/plotly-timeseries";
import { StatCard } from "@/components/stat-card";
import { loadDonorProfile, listDonorSlugs, loadSummary } from "@/lib/data";
import { formatNumber, formatUSD, pct } from "@/lib/format";

export async function generateStaticParams() {
  const slugs = await listDonorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await loadDonorProfile(slug);
  if (!profile) return { title: "Foundation not found" };
  return { title: `${profile.name} — OECD Philanthropy Atlas` };
}

export default async function DonorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [profile, summary] = await Promise.all([
    loadDonorProfile(slug),
    loadSummary(),
  ]);
  if (!profile) notFound();

  const flowSummary = profile.flow_split.reduce((s, f) => s + f.disbursement, 0);
  const crossBorder = profile.flow_split.find((f) => f.flow === "Cross-border");
  const crossBorderShare = crossBorder ? crossBorder.disbursement / flowSummary : 0;

  return (
    <>
      {/* hero */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-12 pb-10">
          <div className="text-[12px] text-[var(--muted)] mb-3">
            <Link href="/donors" className="hover:text-ink underline-offset-4 hover:underline">
              ← All foundations
            </Link>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap mb-2">
            <Pill tone="primary">Foundation profile</Pill>
            {profile.donor_country && (
              <span className="text-[13px] text-[var(--muted)]">
                Based in {profile.donor_country}
              </span>
            )}
          </div>
          <h1 className="font-serif text-[34px] md:text-[48px] leading-[1.1] tracking-tight text-ink">
            {profile.name}
          </h1>
          <p className="mt-4 text-[15px] md:text-[17px] text-[var(--muted)] leading-relaxed max-w-2xl">
            {summarize(profile, summary, crossBorderShare)}
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard label="Disbursed" value={formatUSD(profile.disbursement)} accent />
            <StatCard
              label="Share of dataset"
              value={pct(profile.disbursement, summary.total_disbursement_usd_mn)}
            />
            <StatCard label="Grants" value={formatNumber(profile.n_grants)} />
            <StatCard
              label="Cross-border"
              value={
                crossBorderShare > 0
                  ? `${(crossBorderShare * 100).toFixed(0)}%`
                  : "—"
              }
              sub={crossBorderShare > 0 ? "of disbursement" : "no flow data"}
            />
          </div>
        </div>
      </section>

      <Section eyebrow="Where the money goes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="By sector" description="Top 10 OECD CRS sectors">
            <BarList
              items={profile.by_sector.map((s) => ({
                label: s.sector,
                value: s.disbursement,
              }))}
              accent="forest"
            />
          </Card>
          <Card title="By recipient country" description="Top 15 destinations">
            <BarList
              items={profile.by_country.map((c) => ({
                label: c.country,
                value: c.disbursement,
              }))}
              accent="accent"
            />
          </Card>
        </div>
      </Section>

      <Section eyebrow="Over time and by region">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <Card title="Disbursement by year">
            {profile.by_year.length > 0 ? (
              <PlotlyTimeSeries
                series={[
                  {
                    name: `${profile.name} disbursement`,
                    data: profile.by_year.map((d) => ({ year: d.year, value: d.disbursement })),
                  },
                ]}
                height={280}
                yLabel="Disbursement (USD millions)"
              />
            ) : (
              <div className="text-[14px] text-[var(--muted)] py-6 italic">
                Year-level data unavailable (NDA-aggregated reporting).
              </div>
            )}
          </Card>
          <Card title="By region">
            <BarList
              items={profile.by_region.map((r) => ({
                label: r.region,
                value: r.disbursement,
              }))}
            />
          </Card>
        </div>
      </Section>

      <Section eyebrow="A sample of grants">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.sample_grants.map((g, i) => (
            <Card
              key={i}
              padded
              className="hover:border-[var(--primary)] transition-colors"
            >
              <div className="flex items-center gap-2 text-[11px] mb-2 font-mono uppercase tracking-wider text-[var(--accent)]">
                {g.year && <span>{g.year}</span>}
                {g.country && <span>· {g.country}</span>}
                {g.sector && <span>· {g.sector}</span>}
              </div>
              <div className="font-serif text-[16px] text-ink leading-snug mb-2">
                {g.title || "Untitled grant"}
              </div>
              {g.description && (
                <p className="text-[13px] text-[var(--muted)] leading-relaxed">
                  {g.description}
                  {g.description.length >= 240 && "…"}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex justify-between text-[12px]">
                <span className="text-[var(--subtle)] font-mono uppercase tracking-wider">
                  Disbursement
                </span>
                <span className="font-mono tabular-nums text-ink">
                  {formatUSD(g.disbursement)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}

function summarize(
  p: Awaited<ReturnType<typeof loadDonorProfile>>,
  s: Awaited<ReturnType<typeof loadSummary>>,
  crossBorderShare: number
): string {
  if (!p) return "";
  const topSector = p.by_sector[0]?.sector ?? "—";
  const topCountry = p.by_country[0]?.country ?? "—";
  const flowDescriptor =
    crossBorderShare > 0.95
      ? "almost entirely cross-border"
      : crossBorderShare < 0.05
        ? "almost entirely domestic"
        : `roughly ${(crossBorderShare * 100).toFixed(0)}% cross-border`;
  return `${formatUSD(p.disbursement)} disbursed across ${formatNumber(
    p.n_grants
  )} grants — ${flowDescriptor}. ${topSector} is the largest sector; ${topCountry} the largest single recipient.`;
}
