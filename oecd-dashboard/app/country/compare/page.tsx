import { Section } from "@/components/section";
import { CompareClient } from "./compare-client";
import { listCountrySlugs, loadCountryProfile } from "@/lib/data";

export const metadata = { title: "Compare countries | OECD Decision Atlas" };

export default async function CompareCountriesPage() {
  const slugs = await listCountrySlugs();
  // Pre-render the full list of country names + slugs for the client picker
  const profiles = await Promise.all(slugs.map((s) => loadCountryProfile(s)));
  const list = profiles
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({
      slug: p.slug,
      country: p.country,
      total: p.total_disbursement_usd_mn,
      isDac: p.is_dac_member,
    }))
    .sort((a, b) => a.country.localeCompare(b.country));

  return (
    <Section
      eyebrow="Compare"
      title="Place two countries side by side."
      description="Pick any two donor countries and see their philanthropy profiles compared on the same dimensions used in DAC peer reviews. The third column shows where the two profiles differ most."
    >
      <CompareClient countries={list} />
    </Section>
  );
}
