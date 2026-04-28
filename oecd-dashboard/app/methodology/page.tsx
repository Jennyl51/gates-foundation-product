import { Section } from "@/components/section";
import { Card, Pill } from "@/components/card";
import { Term } from "@/components/glossary";
import { loadLegend, loadSummary } from "@/lib/data";
import { formatNumber, formatUSD } from "@/lib/format";

export const metadata = { title: "Methodology | OECD Decision Atlas" };

export default async function MethodologyPage() {
  const [legend, summary] = await Promise.all([loadLegend(), loadSummary()]);

  const notes: { title: string; body: string; tone?: "primary" | "accent" }[] = [
    {
      title: "Trust tier on every figure (A / B / C)",
      body: "Each number on the dashboard carries a small badge. Tier A (✓) means the figure matches an OECD published canonical figure within ±2%. Tier B (◔) means we have not matched it to a single published canonical, but it is recomputed correctly from the source spreadsheet using a documented aggregation rule. Tier C (⚠) means the underlying sample is small (typically <50 grants) and the number should be read as directional. Most of the dashboard ships at Tier B today; a future revision will lift figures to Tier A as canonical matches are confirmed.",
      tone: "primary",
    },
    {
      title: "Two complementary mis-alignment lenses",
      body: "The goal-alignment page reports philanthropic dollars per UN goal versus where the world is furthest from each goal (world-level), and dollars to the United Nations Least Developed Countries versus the population those countries hold (country-tier). The two lenses can disagree, and that is a feature: the world-level lens emphasises issue-area imbalance; the country-tier lens emphasises distributional fairness. The country-by-goal version (a third lens) was not buildable in this environment because the Sustainable Development Report's country-level CSV was not reachable.",
    },
    {
      title: "Simpson's-paradox flag on aggregated trends",
      body: "Wherever the dashboard shows a trend over time on an aggregated slice, the same trend is also computed split by cross-border philanthropy versus domestic philanthropy. If the aggregated trend reverses direction once split, a flag fires. Three such reversals exist in the 2020 to 2023 window; the most striking is education funding in Asia, which rose in aggregate only because of domestic-philanthropy growth, while cross-border education funding in Asia actually fell.",
      tone: "primary",
    },
    {
      title: "All amounts are USD millions, deflated to 2023 constant prices",
      body: "Both disbursements (usd_disbursements_defl) and commitments (usd_commitment_defl) are reported by the OECD in 2023 constant US dollars. This removes inflation from year-over-year comparisons, but means our totals will not match nominal-dollar reports for the same period.",
    },
    {
      title: "Disbursement vs commitment, and why they don't agree",
      body: `The dataset reports a total of ${formatUSD(summary.total_disbursement_usd_mn)} disbursed and ${formatUSD(summary.total_commitment_usd_mn)} committed across the same period. The gap is real: not every foundation reports both, commitments are recorded at signing and disbursements at payment, and a multi-year commitment may pay out across years not all visible here. We use disbursements as the headline metric because they reflect money that actually moved.`,
      tone: "primary",
    },
    {
      title: "The '2020 to 2023' aggregate quirk",
      body: `${summary.aggregate_rows} rows in the dataset use the special year value '2020 to 2023' instead of a single year. These belong to foundations that signed an NDA to share their data only in aggregate form. They are excluded from any year-by-year time series but included in totals, donor profiles, and sector breakdowns.`,
      tone: "accent",
    },
    {
      title: "Recipient country aggregates ('Bilateral, unspecified', regional codes)",
      body: "Many grants are reported at a regional or supranational level rather than to a single country, for example 'South of Sahara, regional' or 'Bilateral, unspecified'. We surface these honestly rather than discarding them. The Overview's recipient ranking excludes them so country-level patterns are visible, but they are kept in the explorer and donor profiles.",
    },
    {
      title: "Cross-border vs domestic philanthropy",
      body: `${summary.share_cross_border}% of grants are cross-border. The remainder is domestic philanthropy: a foundation giving inside its own country. Mexico, India, China and Spain have substantial domestic flows that would disappear from a 'foreign aid' view of the data.`,
    },
    {
      title: "Policy markers are 0/1/2 scores, not dollar splits",
      body: "Gender, climate (mitigation and adaptation), environment, biodiversity, desertification and nutrition each carry a marker on a 0-2 scale. We aggregate dollars for grants where the marker is the principal objective (score 2) so totals do not double-count, but a single grant can carry markers in multiple dimensions.",
    },
    {
      title: "SDG targets are multi-tag",
      body: "The sdg_focus column contains semicolon-separated SDG targets (e.g. '15.1; 15.5'). We extract the parent goal (1-17) for each target and sum dollars per goal. Because a single grant can support multiple goals, the sum across goals will exceed the dataset total; this is intentional and matches how the OECD reports SDG alignment.",
    },
    {
      title: "Top-50-donor profiles",
      body: "Per-foundation profile pages are generated at build time for the 50 largest foundations by disbursement. They include sectoral mix, geographic footprint, year trend, and a sample of the largest grants with project descriptions. Other foundations appear in totals and the explorer but do not currently have a dedicated page.",
    },
  ];

  return (
    <>
      <Section
        eyebrow="Methodology"
        title="How the dashboard is built and what to trust."
        description={
          <>
            A concise, auditable summary of how we transformed the{" "}
            <Term k="OECD">OECD</Term> philanthropy database into the views you
            see across this site. Practitioners reviewing our work will find every
            claim is traceable to either a column in the source CSV or a
            transformation in the build script.
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Source rows" value={formatNumber(summary.rows)} sub="OECD philanthropy DB" />
          <Stat
            label="After year-cleaning"
            value={formatNumber(summary.single_year_rows)}
            sub={`${summary.aggregate_rows} aggregate rows`}
          />
          <Stat
            label="Headline metric"
            value="Disbursement"
            sub="USD mn, 2023 constant"
          />
          <Stat label="Date range" value={`${summary.year_min} - ${summary.year_max}`} />
        </div>
      </Section>

      <Section eyebrow="What to know" title="Eight notes for serious readers">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {notes.map((n, i) => (
            <Card key={i} padded>
              <div className="flex items-start gap-3 mb-2">
                <span className="font-mono text-[11px] text-[var(--subtle)] tabular-nums mt-1">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-serif text-[18px] text-ink leading-snug">
                    {n.title}
                  </h3>
                </div>
              </div>
              <p className="text-[14px] text-[var(--muted)] leading-relaxed pl-7">
                {n.body}
              </p>
              {n.tone && (
                <div className="pl-7 mt-3">
                  <Pill tone={n.tone}>Caveat</Pill>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Variable glossary" title="Every column in the source data">
        <Card padded={false} className="overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <tr className="border-b border-[var(--border)]">
                <th className="text-left font-normal py-3 pl-5 pr-3 w-[220px]">Variable</th>
                <th className="text-left font-normal py-3 pr-5">Definition (per OECD)</th>
              </tr>
            </thead>
            <tbody>
              {legend.map((l, i) => (
                <tr key={i} className="border-b border-[var(--border)] align-top">
                  <td className="py-3 pl-5 pr-3 font-mono text-[12px] text-[var(--primary)]">
                    {l.variable}
                  </td>
                  <td className="py-3 pr-5 text-[var(--muted)] leading-relaxed">
                    {l.description.length > 320
                      ? l.description.slice(0, 320) + "…"
                      : l.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section eyebrow="Pipeline" title="Reproducibility">
        <Card padded>
          <ol className="space-y-4 text-[14px] text-[var(--muted)] leading-relaxed list-decimal list-inside">
            <li>
              <span className="text-ink">scripts/preprocess.py</span> reads{" "}
              <span className="font-mono text-[12px]">data/raw/oecd-funding.csv</span> and
              writes a set of compact JSON files into{" "}
              <span className="font-mono text-[12px]">public/data/</span>.
            </li>
            <li>
              The dashboard never touches the raw CSV at runtime; pages render from the
              precomputed JSONs, so loads stay fast and the dataset can be updated by
              dropping in a new CSV and re-running the script.
            </li>
            <li>
              All formatting (USD compaction, percentages, tabular numbers) goes through{" "}
              <span className="font-mono text-[12px]">lib/format.ts</span> for consistency.
            </li>
            <li>
              Charts on diagnose, country, and donor pages are interactive Plotly. Bar
              lists and small ranking visuals stay as hand-rolled SVG, so every visual
              choice is auditable inline rather than buried inside a third-party config.
            </li>
          </ol>
        </Card>
      </Section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-5">
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--accent)]">
        {label}
      </div>
      <div className="font-serif text-[24px] md:text-[28px] mt-1 text-ink leading-tight tabular-nums">
        {value}
      </div>
      {sub && <div className="text-[12px] text-[var(--subtle)] mt-1">{sub}</div>}
    </div>
  );
}
