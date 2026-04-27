import Link from "next/link";
import { Section } from "@/components/section";
import { Scaffold } from "@/components/scaffold";
import { Card, Pill } from "@/components/card";
import { TrustBadge, TrustLegend } from "@/components/trust-badge";
import { Term } from "@/components/glossary";
import { PlotlyMisalignment } from "@/components/plotly-misalignment";
import { loadMisalignment } from "@/lib/data";
import { formatUSD } from "@/lib/format";

export const metadata = {
  title: "Goal alignment. OECD Decision Atlas",
};

export default async function SDGDiagnosePage() {
  const m = await loadMisalignment();

  // Sort the world-level misalignment rows by absolute delta. the largest
  // mismatches lead the page.
  const sorted = [...m.world_level].sort((a, b) => Math.abs(b.delta_pp) - Math.abs(a.delta_pp));
  const overfunded = sorted.filter((r) => r.verdict === "overfunded").slice(0, 3);
  const underfunded = sorted.filter((r) => r.verdict === "underfunded").slice(0, 3);

  const topOver = overfunded[0];
  const topUnder = underfunded[0];
  const ldc = m.ldc_tier;

  return (
    <>
      {/* hero */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-12 pb-10">
          <div className="text-[12px] text-[var(--muted)] mb-3">
            <Link href="/" className="hover:text-ink underline-offset-4 hover:underline">
              ← Decision brief
            </Link>
          </div>
          <Pill tone="primary">Diagnosis</Pill>
          <h1 className="mt-4 font-serif text-[34px] md:text-[48px] leading-[1.1] tracking-tight text-ink max-w-3xl">
            Where is private philanthropy{" "}
            <span className="italic text-[var(--primary)]">mis-aligned</span>{" "}
            with the United Nations <Term k="SDG">goals</Term>?
          </h1>
          <p className="mt-4 text-[15px] md:text-[17px] text-[var(--muted)] leading-relaxed max-w-3xl">
            Two complementary lenses on the same dataset. The first compares
            dollars against where the world is furthest from each goal. The
            second compares dollars against where people in greatest need
            actually live, using the United Nations list of{" "}
            <Term k="LDC">Least Developed Countries</Term>.
          </p>
          <div className="mt-6"><TrustLegend /></div>
        </div>
      </section>

      {/* Lens 1. World-level Misalignment */}
      <Section
        eyebrow="Lens 1. World-level"
        title={`${topOver?.name ?? " "} is the largest over-allocation. ${topUnder?.name ?? " "} is the largest under-allocation.`}
        description="Compares philanthropic dollars per goal against the world's distance-to-target across all 17 goals. Both sides of the chart sum to 100%."
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <Card
            title="Misalignment per goal, in percentage points"
            description="Each row is one of the 17 UN goals. Bars going right are over-funded relative to need. Bars going left are under-funded. Hover any bar for the full breakdown of phil share, need share, and dollar amount."
          >
            <PlotlyMisalignment rows={m.world_level} />
            <table className="w-full mt-5 text-[14px] border-t border-[var(--border)]">
              <thead className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="text-left font-normal py-2 pr-2">Goal</th>
                  <th className="text-right font-normal py-2 px-2">$ share</th>
                  <th className="text-right font-normal py-2 px-2">Need share</th>
                  <th className="text-right font-normal py-2 pl-2">Δ pp</th>
                </tr>
              </thead>
              <tbody>
                {m.world_level.map((r) => (
                  <tr key={r.goal} className="border-t border-[var(--border)]">
                    <td className="py-1.5 pr-2 text-ink">
                      <span className="font-mono text-[var(--subtle)] mr-2">{r.goal}</span>
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
                        r.delta_pp >= 2 ? "text-[var(--accent)]" :
                          r.delta_pp <= -2 ? "text-[var(--alert)]" :
                            "text-[var(--subtle)]",
                      ].join(" ")}
                    >
                      {r.delta_pp >= 0 ? "+" : ""}
                      {r.delta_pp.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="space-y-5">
            <Scaffold
              eyebrow="Draft for HLPF input"
              trustTier="B"
              claim={
                <>
                  Private philanthropy over-allocates to {topOver?.name.toLowerCase()} by{" "}
                  <span className="text-[var(--primary)]">+{topOver?.delta_pp.toFixed(1)} pp</span>{" "}
                  while under-allocating to {topUnder?.name.toLowerCase()} by{" "}
                  <span className="text-[var(--alert)]">{topUnder?.delta_pp.toFixed(1)} pp</span>.
                </>
              }
              evidence={[
                <>
                  {topOver?.name} receives{" "}
                  <strong className="text-ink">
                    {topOver?.phil_share_pct.toFixed(1)}%
                  </strong>{" "}
                  of tagged philanthropic dollars but represents only{" "}
                  <strong className="text-ink">
                    {topOver?.need_share_pct.toFixed(1)}%
                  </strong>{" "}
                  of the world&rsquo;s distance-to-target across the 17 goals.
                </>,
                <>
                  {topUnder?.name} receives{" "}
                  <strong className="text-ink">
                    {topUnder?.phil_share_pct.toFixed(1)}%
                  </strong>{" "}
                  of dollars against{" "}
                  <strong className="text-ink">
                    {topUnder?.need_share_pct.toFixed(1)}%
                  </strong>{" "}
                  of need.
                </>,
                <>
                  {underfunded.length} of 17 goals receive philanthropic dollars at least 2 percentage points below their share of need.
                </>,
              ]}
              foundationLens={
                <>
                  The crowded field is {topOver?.name.toLowerCase()}. Foundations
                  considering portfolio differentiation should examine the
                  under-allocated goals, where co-funding density is lower and the
                  marginal grant has more leverage.
                </>
              }
              caveat={
                <>
                  &ldquo;Need&rdquo; here is the world&rsquo;s distance-to-target on each goal,
                  averaged globally. A country-level need lens (e.g. SDR2024
                  country-by-goal scores) would shift these magnitudes. for example,
                  Goal 6 looks more under-funded when weighted by the populations
                  living in low-progress countries.
                </>
              }
              source="Source: OECD philanthropy database 2020 to 2023. UN goal-progress scores (world averages)"
            />
          </div>
        </div>
      </Section>

      {/* Lens 2. Country-tier (LDC) misalignment */}
      <Section
        eyebrow="Lens 2. Country-tier"
        title={
          ldc.verdict === "aligned"
            ? "Philanthropic dollars follow population, not poverty."
            : ldc.verdict === "underfunded"
              ? "Philanthropic dollars under-flow to the poorest countries."
              : "Philanthropic dollars over-flow to the poorest countries."
        }
        description="Compares dollars going to the 46 United Nations Least Developed Countries with the share of population those countries represent inside the recipient set."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="Where the dollars are">
            <div className="space-y-4">
              <RatioBar
                label="Share of dollars to Least Developed Countries"
                pct={ldc.phil_to_ldc_share_pct}
                color="var(--primary)"
              />
              <RatioBar
                label="Share of recipient-country population in Least Developed Countries"
                pct={ldc.ldc_population_share_pct}
                color="var(--accent)"
              />
              <div className="pt-3 mt-3 border-t border-[var(--border)] text-[13px]">
                <span className="text-[var(--muted)]">Difference:</span>{" "}
                <span
                  className={[
                    "font-mono tabular-nums",
                    Math.abs(ldc.delta_pp) < 2
                      ? "text-[var(--forest)]"
                      : ldc.delta_pp < 0
                        ? "text-[var(--alert)]"
                        : "text-[var(--accent)]",
                  ].join(" ")}
                >
                  {ldc.delta_pp >= 0 ? "+" : ""}
                  {ldc.delta_pp.toFixed(2)} pp
                </span>{" "}
                <span className="text-[var(--muted)]">  {ldc.verdict}</span>
                <span className="ml-2"><TrustBadge tier="B" /></span>
              </div>
            </div>
          </Card>

          <Scaffold
            eyebrow="Draft for parliamentary response"
            trustTier="B"
            claim={
              <>
                Private philanthropy distributes dollars roughly in proportion to
                population. not in proportion to poverty.
              </>
            }
            evidence={[
              <>
                {formatUSD(ldc.phil_to_ldc_usd_mn)} of recorded named-country disbursement
                ({ldc.phil_to_ldc_share_pct.toFixed(1)}% of {formatUSD(ldc.phil_named_total_usd_mn)})
                reaches the 46 Least Developed Countries.
              </>,
              <>
                Those same countries hold{" "}
                {ldc.ldc_population_share_pct.toFixed(1)}% of the population across all
                named recipient countries. leaving a gap of {Math.abs(ldc.delta_pp).toFixed(2)}{" "}
                percentage points.
              </>,
              <>
                {ldc.n_ldc_countries_in_data} of the {ldc.n_ldc_countries_total} Least
                Developed Countries appear in the dataset (Tuvalu has no recorded
                philanthropic disbursement in this window).
              </>,
            ]}
            foundationLens={
              <>
                Counter-intuitively, philanthropy is not poverty-tilted at the
                country tier. A foundation seeking distributional impact would need
                to over-weight Least Developed Countries to move this number.
              </>
            }
            caveat={
              <>
                Population is taken across countries that appear in the OECD philanthropy
                dataset, not the entire global population. &ldquo;Bilateral, unspecified&rdquo;
                grants and regional aggregates are excluded from both sides of the
                comparison.
              </>
            }
            source="Source: OECD philanthropy database 2020 to 2023. UN list of Least Developed Countries. World Bank populations (2023)"
          />
        </div>
      </Section>

      {/* Method note */}
      <Section eyebrow="Method">
        <Card padded>
          <p className="text-[14px] text-[var(--muted)] leading-relaxed">
            {m.method_note}
          </p>
          <p className="text-[12px] text-[var(--subtle)] mt-3 leading-relaxed">
            Trust tier B applies throughout: figures recompute correctly from the
            source spreadsheet but have not yet been matched against OECD&rsquo;s own
            published canonical totals. Methodology details on{" "}
            <Link href="/methodology" className="underline underline-offset-2">
              the methodology page
            </Link>.
          </p>
        </Card>
      </Section>
    </>
  );
}

function RatioBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[13px] mb-1">
        <span className="text-ink">{label}</span>
        <span className="font-mono tabular-nums text-[var(--muted)]">{pct.toFixed(1)}%</span>
      </div>
      <div className="relative h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${Math.min(100, pct)}%`, background: color }}
        />
      </div>
    </div>
  );
}

