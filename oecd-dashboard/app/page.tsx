import Link from "next/link";
import { Section } from "@/components/section";
import { StatCard } from "@/components/stat-card";
import { BarList } from "@/components/bar-list";
import { TimeSeriesChart } from "@/components/timeseries-chart";
import { Card, Pill } from "@/components/card";
import {
  loadSummary,
  loadTopDonors,
  loadRecipientCountries,
  loadDonorCountries,
  loadSectors,
  loadTimeseries,
  loadJudgeQuestions,
  loadFlows,
} from "@/lib/data";
import { formatUSD, formatNumber, isUnspecifiedCountry, pct } from "@/lib/format";

export default async function HomePage() {
  const [summary, topDonors, recipients, donorCountries, sectors, timeseries, judge, flows] =
    await Promise.all([
      loadSummary(),
      loadTopDonors(),
      loadRecipientCountries(),
      loadDonorCountries(),
      loadSectors(),
      loadTimeseries(),
      loadJudgeQuestions(),
      loadFlows(),
    ]);

  const namedRecipients = recipients.filter((r) => !isUnspecifiedCountry(r.country));
  const totalDisb = summary.total_disbursement_usd_mn;

  return (
    <>
      {/* HERO */}
      <section className="border-b border-[var(--border)] bg-paper">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-12 pb-10 md:pt-20 md:pb-16">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-5">
            OECD philanthropy database · 2020 – 2023
          </div>
          <h1 className="font-serif text-[40px] md:text-[60px] leading-[1.05] tracking-tight text-ink max-w-4xl">
            Where the world&rsquo;s
            <br />
            <span className="italic text-[var(--primary)]">private foundations</span>
            {" "}give.
          </h1>
          <p className="mt-6 text-[17px] md:text-[19px] text-[var(--muted)] leading-relaxed max-w-2xl">
            An interactive atlas of{" "}
            <span className="text-ink font-medium">{formatUSD(totalDisb)}</span> in
            philanthropic disbursements across{" "}
            <span className="text-ink font-medium">
              {formatNumber(summary.n_foundations)} foundations
            </span>{" "}
            and{" "}
            <span className="text-ink font-medium">
              {formatNumber(summary.n_recipient_countries)} countries
            </span>
            . Built on the OECD&rsquo;s standardised dataset, normalised to 2023
            constant US dollars.
          </p>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              label="Disbursed"
              value={formatUSD(totalDisb)}
              sub={`${formatNumber(summary.rows)} grants`}
              accent
            />
            <StatCard
              label="Foundations"
              value={formatNumber(summary.n_foundations)}
              sub={`${formatNumber(summary.n_donor_countries)} donor countries`}
            />
            <StatCard
              label="Recipient countries"
              value={formatNumber(summary.n_recipient_countries)}
              sub={`${formatNumber(summary.n_sectors)} OECD sectors`}
            />
            <StatCard
              label="Cross-border"
              value={`${summary.share_cross_border}%`}
              sub="of grants leave the donor's country"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-[14px] hover:bg-[var(--primary-deep)] transition-colors"
            >
              Open the explorer →
            </Link>
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border-strong)] text-ink text-[14px] hover:bg-black/[0.03] transition-colors"
            >
              See SDG &amp; marker breakdown
            </Link>
          </div>
        </div>
      </section>

      {/* JUDGE QUESTIONS — pre-baked answers */}
      <Section
        eyebrow="Answers, not just charts"
        title="The questions a program officer would actually ask"
        description="The kickoff brief listed five questions a foundation leader might bring to a dashboard. Here they are answered directly — every figure is a live link into the explorer."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {judge.map((q) => (
            <JudgeAnswerCard key={q.id} q={q} />
          ))}
        </div>
      </Section>

      {/* WHO GIVES, WHO RECEIVES */}
      <Section
        eyebrow="The big picture"
        title="The dollars are concentrated — at both ends."
        description="Three foundations account for almost half of every dollar disbursed. Mexico, India and China are simultaneously some of the largest recipients and largest donor home-countries — domestic philanthropy is half the story."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card
            title="Top 10 foundations by disbursement"
            description={`The top 3 alone account for ${pct(
              topDonors.slice(0, 3).reduce((s, d) => s + d.disbursement, 0),
              totalDisb
            )} of all $ tracked.`}
            cta={
              <Link href="/donors" className="text-[var(--primary)] hover:underline">
                All donors →
              </Link>
            }
          >
            <BarList
              items={topDonors.slice(0, 10).map((d) => ({
                label: d.name,
                value: d.disbursement,
                sub: d.donor_country ?? undefined,
                href: `/donors/${d.slug}`,
                highlight: d.slug === "gates-foundation",
              }))}
            />
          </Card>
          <Card
            title="Top 10 recipient countries"
            description="Excludes regional / unspecified aggregates so country-level patterns are visible."
            cta={
              <Link href="/explore" className="text-[var(--primary)] hover:underline">
                Filter →
              </Link>
            }
          >
            <BarList
              accent="accent"
              items={namedRecipients.slice(0, 10).map((r) => ({
                label: r.country,
                value: r.disbursement,
                sub: r.region_macro ?? undefined,
              }))}
            />
          </Card>
        </div>
      </Section>

      {/* OVER TIME */}
      <Section
        eyebrow="Over time"
        title="$68B disbursed across four years — but the trend isn't flat."
        description="Total disbursements peaked in 2021 alongside the global COVID response, then settled. Look beneath the totals and the picture is sectoral: health spending compressed as climate and reproductive-health spending expanded."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card title="Disbursements by year" className="lg:col-span-2">
            <TimeSeriesChart
              series={[
                {
                  name: "Disbursement",
                  data: timeseries.by_year.map((d) => ({ x: d.year, y: d.disbursement })),
                },
              ]}
              height={260}
            />
          </Card>
          <Card title="Cross-border vs domestic">
            <div className="space-y-4">
              {flows.map((f) => {
                const total = flows.reduce((s, x) => s + x.disbursement, 0);
                const sharePct = (f.disbursement / total) * 100;
                return (
                  <div key={f.flow}>
                    <div className="flex justify-between text-[13px] text-ink mb-1">
                      <span className="capitalize">{f.flow}</span>
                      <span className="font-mono tabular-nums">
                        {formatUSD(f.disbursement)}
                      </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-[var(--primary-soft)] overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${sharePct}%`,
                          background:
                            f.flow === "Cross-border"
                              ? "var(--primary)"
                              : "var(--accent)",
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-[var(--subtle)] mt-1 font-mono">
                      {sharePct.toFixed(1)}% of grants
                    </div>
                  </div>
                );
              })}
              <p className="text-[12px] text-[var(--muted)] pt-2 border-t border-[var(--border)] leading-relaxed">
                Domestic philanthropy is invisible in most global dashboards.
                Mexico is both the #2 donor country and the #1 recipient country —
                that asymmetry only appears when you keep both flow types.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* SECTOR + DONOR COUNTRY SPLIT */}
      <Section
        eyebrow="Where the money goes"
        title="Health absorbs more than every other sector combined."
        description="OECD CRS sectoral coding lets us put a dollar value on each cause area. Health and Government & Civil Society together account for over half of the dataset."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="Top 10 sectors">
            <BarList
              items={sectors.slice(0, 10).map((s) => ({
                label: s.sector,
                value: s.disbursement,
                sub: `${s.n_donors} foundations`,
              }))}
              accent="forest"
            />
          </Card>
          <Card
            title="Top 10 donor home countries"
            description={`${formatNumber(summary.n_donor_countries)} countries contain at least one tracked foundation.`}
          >
            <BarList
              items={donorCountries.slice(0, 10).map((d) => ({
                label: d.country,
                value: d.disbursement,
                sub: `${d.n_foundations} foundations`,
              }))}
            />
          </Card>
        </div>
      </Section>

      {/* CALL TO EXPLORE */}
      <Section>
        <Card padded={false} className="p-7 md:p-10 bg-[var(--primary)] border-[var(--primary)]">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="text-white">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/60 mb-2">
                Now you try
              </div>
              <h3 className="font-serif text-[24px] md:text-[30px] leading-tight">
                Slice it your way.
              </h3>
              <p className="mt-2 text-white/80 max-w-xl text-[15px] leading-relaxed">
                Filter by year, donor country, recipient region and sector. Drill into
                any of {formatNumber(summary.n_foundations)} foundations or any of {summary.n_sectors} OECD sectors.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[var(--primary-deep)] text-[14px] hover:bg-[var(--paper)] transition-colors"
              >
                Open explorer →
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 text-white text-[14px] hover:bg-white/10 transition-colors"
              >
                Methodology
              </Link>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Pre-baked judge answers — supports donor_list / country_list / timeseries
// ---------------------------------------------------------------------------

function JudgeAnswerCard({ q }: { q: Awaited<ReturnType<typeof loadJudgeQuestions>>[number] }) {
  return (
    <Card>
      <div className="flex items-start gap-3 mb-3">
        <Pill tone="primary">Q</Pill>
        <div className="text-ink leading-snug">{q.question}</div>
      </div>

      {q.answer_type === "donor_list" && (
        <BarList
          items={q.answer.slice(0, 5).map((a) => ({
            label: a.name,
            value: a.disbursement,
            href: `/donors/${a.slug}`,
          }))}
          accent="primary"
          showRank
        />
      )}

      {q.answer_type === "country_list" && (
        <BarList
          items={q.answer.slice(0, 5).map((a) => ({
            label: a.country,
            value: a.disbursement,
          }))}
          accent="accent"
          showRank
        />
      )}

      {q.answer_type === "timeseries" && (
        <TimeSeriesChart
          series={[
            {
              name: "Disbursement",
              data: q.answer.map((a) => ({ x: a.year, y: a.disbursement })),
            },
          ]}
          height={180}
        />
      )}

      <div className="mt-3 pt-3 border-t border-[var(--border)] text-[11px] font-mono uppercase tracking-wider text-[var(--subtle)]">
        {q.unit}
      </div>
    </Card>
  );
}
