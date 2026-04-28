import Link from "next/link";
import { Section } from "@/components/section";
import { Card } from "@/components/card";
import { TrustBadge } from "@/components/trust-badge";
import { loadPeerSummaries } from "@/lib/data";
import { formatUSD } from "@/lib/format";

export const metadata = { title: "Country profiles | OECD Decision Atlas" };

export default async function CountryIndexPage() {
  const peers = await loadPeerSummaries();
  const stable = peers.filter((p) => p.stable_peer_comparison);
  const directional = peers.filter((p) => !p.stable_peer_comparison);

  return (
    <Section
      eyebrow="Country profiles"
      title="Donor-country profiles for the OECD philanthropy field"
      description="Each profile compares one country's private philanthropy to the OECD-DAC average. Click into any country to see the full peer-comparison scaffold ready to drop into a peer-review chapter, or place two countries side by side."
      cta={
        <Link
          href="/country/compare"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)] text-white text-[14px] font-medium hover:bg-[var(--primary-deep)] transition-colors shadow-sm"
        >
          Compare two countries →
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Group title="Stable peer comparison" sub={`Total disbursement ≥ $100M (${stable.length} countries)`}>
          {stable.map((p) => (
            <CountryRow key={p.slug} p={p} />
          ))}
        </Group>
        <Group title="Directional only" sub={`Total disbursement < $100M (${directional.length} countries)`}>
          {directional.map((p) => (
            <CountryRow key={p.slug} p={p} />
          ))}
        </Group>
      </div>
    </Section>
  );
}

function Group({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <Card padded={false}>
      <div className="px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <h3 className="font-serif text-[18px] text-ink">{title}</h3>
        <p className="text-[12px] text-[var(--muted)] mt-1">{sub}</p>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </Card>
  );
}

function CountryRow({ p }: { p: Awaited<ReturnType<typeof loadPeerSummaries>>[number] }) {
  return (
    <Link
      href={`/country/${p.slug}`}
      className="block px-5 py-3 hover:bg-[var(--primary-soft)]/40 transition-colors"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0 flex items-baseline gap-2">
          <span className="text-ink truncate">{p.country}</span>
          {p.is_dac && <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--forest)]">DAC</span>}
          <TrustBadge tier={p.stable_peer_comparison ? "B" : "C"} />
        </div>
        <span className="font-mono tabular-nums text-[13px] text-ink shrink-0">
          {formatUSD(p.total_disbursement_usd_mn)}
        </span>
      </div>
      {p.biggest_overallocation_vs_dac && p.biggest_underallocation_vs_dac && (
        <div className="mt-1 text-[11px] text-[var(--muted)] flex gap-3">
          <span className="text-[var(--primary)]">
            +{p.biggest_overallocation_vs_dac.delta_pp.toFixed(1)} {p.biggest_overallocation_vs_dac.label}
          </span>
          <span className="text-[var(--alert)]">
            {p.biggest_underallocation_vs_dac.delta_pp.toFixed(1)} {p.biggest_underallocation_vs_dac.label}
          </span>
        </div>
      )}
    </Link>
  );
}
