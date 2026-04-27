import Link from "next/link";
import { Section } from "@/components/section";
import { Card } from "@/components/card";
import { BarList } from "@/components/bar-list";
import { loadTopDonors, loadSummary, loadDonorCountries } from "@/lib/data";
import { formatNumber, formatUSD, pct } from "@/lib/format";

export const metadata = { title: "Donors — OECD Philanthropy Atlas" };

export default async function DonorsIndexPage() {
  const [donors, summary, donorCountries] = await Promise.all([
    loadTopDonors(),
    loadSummary(),
    loadDonorCountries(),
  ]);

  // group donors by donor_country for the right rail
  const byCountry = new Map<string, number>();
  for (const d of donors) {
    const k = d.donor_country ?? "Unspecified";
    byCountry.set(k, (byCountry.get(k) ?? 0) + d.disbursement);
  }

  const top3 = donors.slice(0, 3).reduce((s, d) => s + d.disbursement, 0);

  return (
    <Section
      eyebrow="Foundations"
      title="The 50 largest private foundations in the OECD philanthropy database."
      description={
        <>
          506 foundations report through the OECD framework. The 50 shown here
          account for {pct(
            donors.reduce((s, d) => s + d.disbursement, 0),
            summary.total_disbursement_usd_mn
          )} of all tracked disbursements.
          The top three alone — Gates, BBVAMF, Mastercard — account for {pct(top3, summary.total_disbursement_usd_mn)}.
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <Card padded={false} className="overflow-hidden">
          <table className="w-full text-[14px]">
            <thead className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              <tr className="border-b border-[var(--border)]">
                <th className="text-left font-normal py-3 pl-5 pr-3">#</th>
                <th className="text-left font-normal py-3 pr-3">Foundation</th>
                <th className="text-left font-normal py-3 pr-3 hidden sm:table-cell">
                  Home country
                </th>
                <th className="text-right font-normal py-3 pr-3">Disbursed</th>
                <th className="text-right font-normal py-3 pr-3 hidden md:table-cell">
                  Committed
                </th>
                <th className="text-right font-normal py-3 pr-5">Grants</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d, i) => (
                <tr
                  key={d.slug}
                  className="border-b border-[var(--border)] hover:bg-[var(--primary-soft)]/40 transition-colors"
                >
                  <td className="py-3 pl-5 pr-3 text-[12px] text-[var(--subtle)] font-mono tabular-nums">
                    {i + 1}
                  </td>
                  <td className="py-3 pr-3">
                    <Link
                      href={`/donors/${d.slug}`}
                      className="text-ink hover:text-[var(--primary)] hover:underline underline-offset-4"
                    >
                      {d.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-3 text-[var(--muted)] hidden sm:table-cell">
                    {d.donor_country ?? "—"}
                  </td>
                  <td className="py-3 pr-3 text-right font-mono tabular-nums">
                    {formatUSD(d.disbursement)}
                  </td>
                  <td className="py-3 pr-3 text-right font-mono tabular-nums text-[var(--muted)] hidden md:table-cell">
                    {d.commitment > 0 ? formatUSD(d.commitment) : "—"}
                  </td>
                  <td className="py-3 pr-5 text-right font-mono tabular-nums text-[var(--muted)]">
                    {formatNumber(d.n_grants)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-5">
          <Card title="By home country" description="Top 10 donor countries by disbursement">
            <BarList
              items={donorCountries.slice(0, 10).map((d) => ({
                label: d.country,
                value: d.disbursement,
                sub: `${d.n_foundations} foundations`,
              }))}
            />
          </Card>
          <Card title="Note" padded>
            <p className="text-[13px] text-[var(--muted)] leading-relaxed">
              Profiles are generated for the top 50 foundations. Each profile
              shows the foundation&rsquo;s sector mix, geographic footprint, year-by-year
              disbursements, and a sample of its largest grants — useful for
              quickly understanding what a single foundation prioritises.
            </p>
          </Card>
        </div>
      </div>
    </Section>
  );
}
