import { Section } from "@/components/section";
import { loadExplorer, loadSummary } from "@/lib/data";
import { ExplorerClient } from "./explorer-client";

export const metadata = {
  title: "Explore. OECD Philanthropy Atlas",
};

export default async function ExplorePage() {
  const [{ rows }, summary] = await Promise.all([loadExplorer(), loadSummary()]);
  return (
    <Section
      eyebrow="Explorer"
      title="Slice the dataset by year, country, region, and sector."
      description="Pick any combination of filters. The numbers and rankings recompute against the underlying OECD aggregates in real time."
    >
      <ExplorerClient rows={rows} summary={summary} />
    </Section>
  );
}
