import Link from "next/link";
import { Section } from "@/components/section";
import { Card, Pill } from "@/components/card";
import { BarList } from "@/components/bar-list";
import { ColumnChart } from "@/components/column-chart";
import { loadMarkers, loadSDG, loadSummary, loadChannels } from "@/lib/data";
import { formatNumber, formatUSD, pct } from "@/lib/format";

export const metadata = { title: "Insights — OECD Philanthropy Atlas" };

const SDG_LABELS: Record<number, string> = {
  1: "No poverty",
  2: "Zero hunger",
  3: "Good health",
  4: "Quality education",
  5: "Gender equality",
  6: "Clean water",
  7: "Affordable energy",
  8: "Decent work",
  9: "Industry & infrastructure",
  10: "Reduced inequalities",
  11: "Sustainable cities",
  12: "Responsible consumption",
  13: "Climate action",
  14: "Life below water",
  15: "Life on land",
  16: "Peace & justice",
  17: "Partnerships",
};

export default async function InsightsPage() {
  const [markers, sdg, summary, channels] = await Promise.all([
    loadMarkers(),
    loadSDG(),
    loadSummary(),
    loadChannels(),
  ]);

  return (
    <>
      <Section
        eyebrow="Beyond dollars and countries"
        title="What outcomes are foundations actually buying?"
        description={
          <>
            The OECD framework attaches policy markers and SDG targets to most grants —
            scoring, on a 0/1/2 scale, whether each project targets gender equality,
            climate change, environment, biodiversity or nutrition. These markers turn
            an aid database into a policy lens. Most other dashboards skip this signal
            entirely.
          </>
        }
      />

      {/* MARKERS */}
      <Section eyebrow="Policy markers" title="Six lenses on the same money" id="markers">
        <p className="text-[14px] text-[var(--muted)] max-w-3xl mb-8 leading-relaxed">
          Each marker is scored <span className="font-mono">0</span> (not targeted),{" "}
          <span className="font-mono">1</span> (significant objective), or{" "}
          <span className="font-mono">2</span> (principal objective). &ldquo;Principal&rdquo;
          grants are those where the marker theme <em>is the point</em> of the project,
          not a side benefit.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {markers.map((m) => {
            const principal = m.by_score["2"];
            const significant = m.by_score["1"];
            const principalShare = principal.disbursement / m.screened_disbursement;
            const significantShare = significant.disbursement / m.screened_disbursement;

            return (
              <Card key={m.code} padded>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="font-serif text-[20px] text-ink">{m.label}</h3>
                  <Pill tone="accent">
                    {formatUSD(principal.disbursement)} principal
                  </Pill>
                </div>
                <p className="text-[12px] text-[var(--muted)] mb-4">
                  {formatNumber(m.screened_grants)} grants screened ·{" "}
                  {formatUSD(m.screened_disbursement)} screened total
                </p>

                <div className="space-y-2 mb-5">
                  <ScoreBar
                    label="Principal objective (score 2)"
                    color="var(--primary)"
                    share={principalShare}
                    value={formatUSD(principal.disbursement)}
                    n={principal.n_grants}
                  />
                  <ScoreBar
                    label="Significant objective (score 1)"
                    color="var(--accent)"
                    share={significantShare}
                    value={formatUSD(significant.disbursement)}
                    n={significant.n_grants}
                  />
                </div>

                {m.principal_top_donors.length > 0 && (
                  <div className="border-t border-[var(--border)] pt-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] mb-2">
                      Top principal-objective donors
                    </div>
                    <BarList
                      items={m.principal_top_donors.slice(0, 5).map((d) => ({
                        label: d.name,
                        value: d.disbursement,
                        href: `/donors/${d.slug}`,
                      }))}
                      accent="primary"
                      showRank={false}
                    />
                  </div>
                )}

                {m.principal_top_sectors.length > 0 && (
                  <div className="border-t border-[var(--border)] pt-4 mt-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] mb-2">
                      Where it lands (sectors)
                    </div>
                    <BarList
                      items={m.principal_top_sectors.slice(0, 5).map((s) => ({
                        label: s.sector,
                        value: s.disbursement,
                      }))}
                      accent="forest"
                      showRank={false}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Section>

      {/* SDG */}
      <Section
        eyebrow="UN sustainable development goals"
        title="Funding mapped to the 17 SDGs"
        description="The OECD records relevant SDG targets per grant. Below, every grant&rsquo;s SDG focus is exploded to its parent goals — a single grant can count toward multiple goals."
      >
        <Card>
          <ColumnChart
            data={sdg.map((s) => ({
              label: `${s.goal}. ${SDG_LABELS[s.goal] ?? "—"}`,
              value: s.disbursement,
              highlight:
                s.goal === sdg.reduce((m, x) => (x.disbursement > m.disbursement ? x : m), sdg[0]).goal,
            }))}
          />
          <div className="mt-3 text-[12px] text-[var(--muted)] flex justify-between">
            <span>
              SDG focus tagged on {pct(
                sdg.reduce((s, g) => s + g.n_grants, 0),
                summary.rows * 2  // approximate; multi-tag rows
              )} of grants. Multi-tag aware.
            </span>
            <Link href="/explore" className="text-[var(--primary)] hover:underline">
              Filter the explorer →
            </Link>
          </div>
        </Card>
      </Section>

      {/* CHANNELS */}
      <Section
        eyebrow="How money is delivered"
        title="The channel of delivery"
        description="The OECD &lsquo;channel of delivery&rsquo; tells us who actually receives and spends each dollar — multilateral organisations, NGOs, public sector implementers, public-private partnerships, or others."
      >
        <Card>
          <BarList
            items={channels.slice(0, 15).map((c) => ({
              label: c.channel,
              value: c.disbursement,
              sub: `${formatNumber(c.n_grants)} grants`,
            }))}
            accent="primary"
          />
          <p className="text-[12px] text-[var(--muted)] mt-4 pt-3 border-t border-[var(--border)] leading-relaxed">
            For a foundation considering a partner, the channel mix tells you who
            the rest of the field already trusts to execute on the ground.
          </p>
        </Card>
      </Section>
    </>
  );
}

function ScoreBar({
  label,
  color,
  share,
  value,
  n,
}: {
  label: string;
  color: string;
  share: number;
  value: string;
  n: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px] mb-1">
        <span className="text-ink">{label}</span>
        <span className="font-mono tabular-nums text-[var(--muted)]">
          {value} · {formatNumber(n)} grants
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${Math.max(0, Math.min(100, share * 100))}%`, background: color }}
        />
      </div>
      <div className="text-[11px] font-mono text-[var(--subtle)] mt-1">
        {(share * 100).toFixed(1)}% of screened disbursement
      </div>
    </div>
  );
}
