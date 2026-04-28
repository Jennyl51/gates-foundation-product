import Link from "next/link";
import { Section } from "@/components/section";
import { Card, Pill } from "@/components/card";
import { Scaffold, KPI } from "@/components/scaffold";
import { TrustBadge, TrustLegend } from "@/components/trust-badge";
import { Term } from "@/components/glossary";
import { KpiSelector } from "@/components/kpi-selector";
import {
  loadSummary,
  loadMisalignment,
  loadSimpsonsFlags,
  loadConcentration,
  loadKpiHighlights,
} from "@/lib/data";
import { formatNumber, formatUSD } from "@/lib/format";

export default async function HomePage() {
  const [summary, kpiHighlights, m, simpsons, conc] = await Promise.all([
    loadSummary(),
    loadKpiHighlights(),
    loadMisalignment(),
    loadSimpsonsFlags(),
    loadConcentration(),
  ]);

  const sortedDelta = [...m.world_level].sort((a, b) => Math.abs(b.delta_pp) - Math.abs(a.delta_pp));
  const topMis = sortedDelta[0];
  const topUnder = sortedDelta.find((r) => r.verdict === "underfunded");
  const topSimpson = simpsons[0];
  const topConc = conc.find((c) => c.concentration_band === "high");

  return (
    <>
      {/* HERO */}
      <section className="border-b border-[var(--border)] bg-paper">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-12 pb-10 md:pt-20 md:pb-16">
          <div className="font-mono text-[12px] tracking-[0.2em] uppercase text-[var(--accent)] mb-5">
            OECD Decision Atlas. 2020 to 2023. USD 2023 constant.
          </div>
          <h1 className="font-serif text-[42px] md:text-[64px] leading-[1.05] tracking-tight text-ink max-w-4xl">
            Where is{" "}
            <span className="italic text-[var(--primary)]">private philanthropy</span>{" "}
            misaligned with public goals,
            <br />
            and what should we do about it?
          </h1>
          <p className="mt-7 text-[18px] md:text-[20px] text-ink leading-relaxed max-w-3xl">
            A reading of the <Term>OECD</Term> philanthropy database, framed for
            the policy analyst&rsquo;s brief.
          </p>
          <p className="mt-4 text-[16px] md:text-[17px] text-[var(--muted)] leading-relaxed max-w-3xl">
            Each page holds a draft passage with three parts: a claim, the
            evidence, and a caveat. A small{" "}
            <Term k="trust badge">trust badge</Term> beside every figure signals
            how far our number sits from <Term>OECD</Term>&rsquo;s own.{" "}
            {formatUSD(summary.total_disbursement_usd_mn)} disbursed by{" "}
            {formatNumber(summary.n_foundations)} foundations to{" "}
            {formatNumber(summary.n_recipient_countries)} countries.
          </p>

          {/* <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <KPI label="Disbursed" value={formatUSD(summary.total_disbursement_usd_mn)}
                 sub={`${formatNumber(summary.rows)} grants`} accent trustTier="B" />
            <KPI label="Foundations" value={formatNumber(summary.n_foundations)}
                 sub={`${formatNumber(summary.n_donor_countries)} home countries`} trustTier="B" />
            <KPI label="Recipient countries" value={formatNumber(summary.n_recipient_countries)}
                 sub={`${formatNumber(summary.n_sectors)} OECD sectors`} trustTier="B" />
            <KPI label="Cross-border" value={`${summary.share_cross_border}%`}
                 sub="of grants leave the donor's country" trustTier="B" />
          </div>

          <div className="mt-6"><TrustLegend /></div> */}

<KpiSelector
  highlights={kpiHighlights}
  items={[
    {
      id: "disbursed",
      label: "Disbursed",
      value: formatUSD(summary.total_disbursement_usd_mn),
      sub: `${formatNumber(summary.rows)} grants`,
      accent: true,
      trustTier: "B",
    },
    {
      id: "foundations",
      label: "Foundations",
      value: formatNumber(summary.n_foundations),
      sub: `${formatNumber(summary.n_donor_countries)} home countries`,
      trustTier: "B",
    },
    {
      id: "recipients",
      label: "Recipient countries",
      value: formatNumber(summary.n_recipient_countries),
      sub: `${formatNumber(summary.n_sectors)} OECD sectors`,
      trustTier: "B",
    },
    {
      id: "cross_border",
      label: "Cross-border",
      value: `${summary.share_cross_border}%`,
      sub: "of grants leave the donor's country",
      trustTier: "B",
    },
  ]}
/>

          <div className="mt-6"><TrustLegend /></div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/diagnose/sdg"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--primary-soft)] text-white text-[15px] font-medium hover:bg-[var(--primary)] hover:text-white/70 transition-colors shadow-sm">
              See the goal alignment diagnosis →
            </Link>
            <Link href="/country"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border-2 border-[var(--primary)] text-[var(--primary-deep)] text-[15px] font-medium hover:bg-[var(--primary-soft)] transition-colors">
              Country profiles
            </Link>
            <Link href="/methodology"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border-2 border-[var(--border-strong)] text-ink text-[15px] font-medium hover:border-[var(--primary)] transition-colors">
              Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* THREE RANKED DIAGNOSES */}
      <Section
        eyebrow="Today's diagnoses"
        title="Three findings, ranked by magnitude. Each is a draft scaffold."
        description="Click into any diagnosis to see the full evidence trail and copy the scaffold into a brief."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Diagnosis 1. World-level misalignment */}
          <DiagnosisCard
            n={1}
            href="/diagnose/sdg"
            eyebrow="Goal alignment"
            claim={
              <>
                Philanthropy over-funds {topMis?.name.toLowerCase()} by{" "}
                <span className="text-[var(--primary)]">
                  {topMis?.delta_pp >= 0 ? "+" : ""}
                  {topMis?.delta_pp.toFixed(1)} pp
                </span>{" "}
                while leaving {topUnder?.name.toLowerCase()} short by{" "}
                <span className="text-[var(--alert)]">
                  {topUnder?.delta_pp.toFixed(1)} pp
                </span>.
              </>
            }
            sub={`${formatUSD(topMis?.phil_disbursement_usd_mn ?? 0)} flows to ${topMis?.name}; ${formatUSD(topUnder?.phil_disbursement_usd_mn ?? 0)} to ${topUnder?.name}.`}
            cta="Open diagnosis →"
          />

          {/* Diagnosis 2. Simpson's-paradox flag */}
          {topSimpson && (
            <DiagnosisCard
              n={2}
              href="/methodology#simpsons"
              eyebrow="Hidden reversal"
              claim={
                <>
                  In <strong>{topSimpson.sector}</strong> across {topSimpson.region}, the
                  headline trend reverses sign once you split cross-border from
                  domestic philanthropy.
                </>
              }
              sub={`Overall ${topSimpson.overall_change_usd_mn >= 0 ? "+" : ""}${formatUSD(topSimpson.overall_change_usd_mn)} but cross-border ${topSimpson.cross_border_change_usd_mn >= 0 ? "+" : ""}${formatUSD(topSimpson.cross_border_change_usd_mn)} vs domestic ${topSimpson.domestic_change_usd_mn >= 0 ? "+" : ""}${formatUSD(topSimpson.domestic_change_usd_mn)}. Reporting only the headline misleads.`}
              cta="See method note →"
            />
          )}

          {/* Diagnosis 3. Concentration warning */}
          {topConc && (
            <DiagnosisCard
              n={3}
              href={`/country/${slugifyName(topConc.country)}`}
              eyebrow="Concentration risk"
              claim={
                <>
                  <strong>{topConc.top_donor}</strong> accounts for{" "}
                  {topConc.top_donor_share_pct.toFixed(0)}% of philanthropic{" "}
                  {topConc.sector.toLowerCase()} funding in {topConc.country}.
                </>
              }
              sub={`Single-funder dependency. ${formatUSD(topConc.disbursement_usd_mn)} concentrated across ${topConc.n_donors} donors (Herfindahl ${topConc.hhi.toFixed(0)}).`}
              cta="See country profile →"
            />
          )}
        </div>
      </Section>

      {/* COUNTRY-TIER MISALIGNMENT. the counter-intuitive finding */}
      <Section
        eyebrow="Counter-intuitive finding"
        title="Philanthropy follows population, not poverty."
        description="The 46 United Nations Least Developed Countries hold 17% of the recipient-country population and receive 17% of named-country dollars. The country-tier mis-alignment is essentially zero. at this level."
      >
        <Scaffold
          eyebrow="Draft for parliamentary response"
          trustTier="B"
          claim={
            <>
              Across 2020 to 2023, philanthropic disbursements to the United Nations
              Least Developed Countries are aligned to population share within{" "}
              {Math.abs(m.ldc_tier.delta_pp).toFixed(2)} percentage points. not
              the poverty-tilt many expect.
            </>
          }
          evidence={[
            <>
              {formatUSD(m.ldc_tier.phil_to_ldc_usd_mn)} to the 46 Least Developed
              Countries. {m.ldc_tier.phil_to_ldc_share_pct.toFixed(1)}% of the{" "}
              {formatUSD(m.ldc_tier.phil_named_total_usd_mn)} disbursed to named
              recipient countries.
            </>,
            <>
              Those same countries hold{" "}
              {m.ldc_tier.ldc_population_share_pct.toFixed(1)}% of the population in
              the named-recipient set.
            </>,
            <>
              {m.ldc_tier.n_ldc_countries_in_data} of {m.ldc_tier.n_ldc_countries_total}{" "}
              Least Developed Countries appear in the dataset (Tuvalu has zero
              recorded philanthropic disbursement in this window).
            </>,
          ]}
          foundationLens={
            <>
              For a foundation seeking distributional impact, this is a wedge: the
              field over-weights middle-income recipients. A foundation that
              commits a poverty-weighted strategy moves a number nobody is moving.
            </>
          }
          caveat={
            <>
              Population denominators are computed across the recipient-country set,
              not the world. Regional / unspecified grants are excluded from both
              sides of the comparison. Country-by-goal need scores were not
              available in this build environment; if added, the lens sharpens.
            </>
          }
          source="Source: OECD philanthropy database 2020 to 2023. UN list of Least Developed Countries. World Bank populations 2023"
        />
      </Section>

      {/* CTA */}
      <Section>
        <Card padded className="bg-[var(--primary)] border-[var(--primary)]">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="text-white">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/60 mb-2">
                Now you try
              </div>
              <h3 className="font-serif text-[24px] md:text-[30px] leading-tight">
                Open a country profile or the goal-alignment diagnosis.
              </h3>
              <p className="mt-2 text-white/80 max-w-xl text-[15px] leading-relaxed">
                Each page produces a copy-pastable scaffold with claim, evidence and
                caveat. plus a one-line foundation-reader callout for parity.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/diagnose/sdg"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[var(--primary-deep)] text-[14px] hover:bg-[var(--paper)] transition-colors">
                Goal alignment →
              </Link>
              <Link href="/country"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 text-white text-[14px] hover:bg-white/10 transition-colors">
                Country profiles
              </Link>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}

function DiagnosisCard({
  n,
  href,
  eyebrow,
  claim,
  sub,
  cta,
}: {
  n: number;
  href: string;
  eyebrow: string;
  claim: React.ReactNode;
  sub: string;
  cta: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card padded className="h-full hover:border-[var(--primary)] transition-colors">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-serif italic text-[36px] text-[var(--accent)] leading-none">
            {String(n).padStart(2, "0")}
          </span>
          <div className="flex-1">
            <Pill tone="primary">{eyebrow}</Pill>
          </div>
          <TrustBadge tier="B" />
        </div>
        <p className="font-serif text-[17px] leading-snug text-ink mb-3">{claim}</p>
        <p className="text-[13px] text-[var(--muted)] leading-relaxed mb-4">{sub}</p>
        <span className="text-[13px] text-[var(--primary)] group-hover:underline underline-offset-4">
          {cta}
        </span>
      </Card>
    </Link>
  );
}

function slugifyName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
