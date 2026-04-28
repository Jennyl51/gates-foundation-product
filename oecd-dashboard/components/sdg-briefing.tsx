"use client";

import { useState } from "react";
import type { Misalignment } from "@/lib/data";

/**
 * Top-of-page TL;DR briefing for the Goal Alignment diagnosis. Synthesizes
 * the world-level lens and the country-tier lens into a three-sentence
 * paragraph an analyst can read in 5 seconds. A second button assembles the
 * entire scaffold as markdown and copies it to the clipboard, ready to paste
 * into a brief.
 */
export function SdgBriefing({ m }: { m: Misalignment }) {
  const [copied, setCopied] = useState<"idle" | "ok" | "err">("idle");

  const sortedByMag = [...m.world_level].sort(
    (a, b) => Math.abs(b.delta_pp) - Math.abs(a.delta_pp)
  );
  const topOver = sortedByMag.find((r) => r.verdict === "overfunded");
  const topUnder = sortedByMag.find((r) => r.verdict === "underfunded");
  const ldc = m.ldc_tier;

  const tldr = buildTldr(topOver, topUnder, ldc);
  const markdown = buildMarkdown(m, topOver, topUnder, ldc, tldr);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied("ok");
      setTimeout(() => setCopied("idle"), 2200);
    } catch {
      setCopied("err");
      setTimeout(() => setCopied("idle"), 2200);
    }
  }

  return (
    <div className="rounded-md border-2 border-[var(--primary)] bg-[var(--primary-soft)]/30 p-5 md:p-6 mb-8">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--primary-deep)]">
          TL;DR briefing
        </div>
        <button
          type="button"
          onClick={copy}
          className={[
            "inline-flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full transition-colors shrink-0",
            copied === "ok"
              ? "bg-[var(--forest)] text-white"
              : copied === "err"
                ? "bg-[var(--alert)] text-white"
                : "bg-white text-[var(--primary-deep)] border border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white",
          ].join(" ")}
          aria-label="Copy entire briefing as markdown"
          title="Copies TL;DR, scaffold, and source citation as markdown ready to paste into a Word brief."
        >
          {copied === "ok"
            ? "Copied to clipboard"
            : copied === "err"
              ? "Copy failed"
              : "Copy briefing as markdown"}
        </button>
      </div>
      <p className="font-serif text-[18px] md:text-[20px] leading-relaxed text-ink">
        {tldr}
      </p>
      <p className="mt-3 text-[12px] text-[var(--muted)] font-mono">
        Generated from misalignment.json. Reconciles internally to the OECD
        philanthropy database 2020 to 2023.
      </p>
    </div>
  );
}

function buildTldr(
  topOver: Misalignment["world_level"][number] | undefined,
  topUnder: Misalignment["world_level"][number] | undefined,
  ldc: Misalignment["ldc_tier"]
): string {
  const ldcVerdict =
    ldc.verdict === "aligned"
      ? "philanthropic dollars to the 46 Least Developed Countries are within a percentage point of those countries' population share, so distribution at the LDC tier is essentially aligned"
      : ldc.verdict === "underfunded"
        ? `the 46 Least Developed Countries receive ${ldc.phil_to_ldc_share_pct.toFixed(1)}% of named-recipient dollars but hold ${ldc.ldc_population_share_pct.toFixed(1)}% of the population, leaving a ${Math.abs(ldc.delta_pp).toFixed(1)} pp shortfall`
        : `the 46 Least Developed Countries receive ${ldc.phil_to_ldc_share_pct.toFixed(1)}% of named-recipient dollars against ${ldc.ldc_population_share_pct.toFixed(1)}% of the population, a ${ldc.delta_pp.toFixed(1)} pp tilt toward the poorest`;

  const overPart = topOver
    ? `Across 17 UN goals, philanthropy over-allocates most to ${topOver.name.toLowerCase()} (+${topOver.delta_pp.toFixed(1)} pp vs need)`
    : "Philanthropic allocation across the 17 UN goals shows no goal more than 2 percentage points over its share of need";

  const underPart = topUnder
    ? `and most under-allocates to ${topUnder.name.toLowerCase()} (${topUnder.delta_pp.toFixed(1)} pp).`
    : "and no goal more than 2 percentage points under its share of need.";

  return `${overPart} ${underPart} At the country tier, ${ldcVerdict}.`;
}

function buildMarkdown(
  m: Misalignment,
  topOver: Misalignment["world_level"][number] | undefined,
  topUnder: Misalignment["world_level"][number] | undefined,
  ldc: Misalignment["ldc_tier"],
  tldr: string
): string {
  const lines: string[] = [];
  lines.push("# Goal Alignment briefing");
  lines.push("");
  lines.push("**TL;DR.** " + tldr);
  lines.push("");
  lines.push("## Lens 1. World-level");
  lines.push("");
  if (topOver && topUnder) {
    lines.push(
      `**Claim.** Private philanthropy over-allocates to ${topOver.name.toLowerCase()} by +${topOver.delta_pp.toFixed(1)} pp while under-allocating to ${topUnder.name.toLowerCase()} by ${topUnder.delta_pp.toFixed(1)} pp.`
    );
    lines.push("");
    lines.push("**Evidence.**");
    lines.push(
      `- ${topOver.name} receives ${topOver.phil_share_pct.toFixed(1)}% of tagged philanthropic dollars but represents only ${topOver.need_share_pct.toFixed(1)}% of the world's distance to target across the 17 goals.`
    );
    lines.push(
      `- ${topUnder.name} receives ${topUnder.phil_share_pct.toFixed(1)}% of dollars against ${topUnder.need_share_pct.toFixed(1)}% of need.`
    );
    const underCount = m.world_level.filter((r) => r.verdict === "underfunded").length;
    lines.push(
      `- ${underCount} of 17 goals receive philanthropic dollars at least 2 percentage points below their share of need.`
    );
    lines.push("");
    lines.push(
      "**Caveat.** Need here is the world's distance to target on each goal, averaged globally. A country-level need lens (e.g. SDR2024 country-by-goal scores) would shift these magnitudes. For example, Goal 6 (clean water) looks more under-funded when weighted by the populations living in low-progress countries."
    );
  }
  lines.push("");
  lines.push("## Lens 2. Country tier (Least Developed Countries)");
  lines.push("");
  lines.push(
    `**Claim.** Private philanthropy distributes dollars roughly in proportion to population, not in proportion to poverty. Verdict: ${ldc.verdict}, with a ${ldc.delta_pp >= 0 ? "+" : ""}${ldc.delta_pp.toFixed(2)} pp gap.`
  );
  lines.push("");
  lines.push("**Evidence.**");
  lines.push(
    `- USD ${ldc.phil_to_ldc_usd_mn.toFixed(0)}M of recorded named-country disbursement (${ldc.phil_to_ldc_share_pct.toFixed(1)}% of USD ${ldc.phil_named_total_usd_mn.toFixed(0)}M) reaches the 46 Least Developed Countries.`
  );
  lines.push(
    `- Those countries hold ${ldc.ldc_population_share_pct.toFixed(1)}% of the population across all named recipient countries.`
  );
  lines.push(
    `- ${ldc.n_ldc_countries_in_data} of ${ldc.n_ldc_countries_total} Least Developed Countries appear in the dataset.`
  );
  lines.push("");
  lines.push(
    "**Caveat.** Population denominators are computed across countries that appear in the OECD philanthropy dataset, not the entire global population. Bilateral-unspecified grants and regional aggregates are excluded from both sides of the comparison."
  );
  lines.push("");
  lines.push("## Source");
  lines.push("");
  lines.push(
    "OECD philanthropy database 2020 to 2023. UN list of Least Developed Countries (UN-OHRLLS). World Bank populations 2023. UN Sustainable Development Report 2024 world averages."
  );
  lines.push("All figures in USD millions, deflated to 2023 constant prices.");
  return lines.join("\n");
}
