/**
 * Trust badge. three-tier disclosure on every figure rendered in the app.
 *
 *   <TrustBadge tier="A" />   ✓ matches OECD canon within ±2%
 *   <TrustBadge tier="B" />   ◔ recomputed correctly, internal reconciliation only
 *   <TrustBadge tier="C" />   ⚠ small sample / guardrail tripped, directional only
 *
 * Default tier is "B" (internal-only). the safe baseline for any figure
 * we have not explicitly matched to OECD's published canonical tables.
 */

type Tier = "A" | "B" | "C";

const COPY: Record<Tier, { mark: string; label: string; tooltip: string; cls: string }> = {
  A: {
    mark: "✓",
    label: "OECD canon",
    tooltip: "This figure matches OECD's published canonical figure within ±2%.",
    cls: "bg-[var(--forest-soft)] text-[var(--forest)] border-[var(--forest)]/30",
  },
  B: {
    mark: "◔",
    label: "Internal",
    tooltip:
      "We have not matched this figure to a single OECD published table, but it is recomputed correctly from documented aggregation rules and reconciles internally to the source spreadsheet.",
    cls: "bg-[var(--primary-soft)] text-[var(--primary-deep)] border-[var(--primary)]/30",
  },
  C: {
    mark: "⚠",
    label: "Small sample",
    tooltip:
      "Underlying sample is below the validity threshold (typically <50 grants). Treat the figure as directional, not authoritative.",
    cls: "bg-[var(--accent-soft)] text-[var(--alert)] border-[var(--alert)]/30",
  },
};

export function TrustBadge({
  tier = "B",
  showLabel = false,
}: {
  tier?: Tier;
  showLabel?: boolean;
}) {
  const c = COPY[tier];
  return (
    <span
      title={c.tooltip}
      className={[
        "inline-flex items-center gap-1 px-1.5 py-[1px] rounded-sm border text-[10px] font-mono uppercase tracking-wider align-middle",
        c.cls,
      ].join(" ")}
      aria-label={`Trust tier ${tier}: ${c.tooltip}`}
    >
      <span className="text-[11px] leading-none">{c.mark}</span>
      {showLabel && <span>{c.label}</span>}
    </span>
  );
}

export function TrustLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-[12px] text-[var(--muted)]">
      {(["A", "B", "C"] as Tier[]).map((t) => (
        <span key={t} className="inline-flex items-center gap-1.5">
          <TrustBadge tier={t} showLabel />
          <span className="text-[11px] text-[var(--subtle)]">{COPY[t].tooltip.split(".")[0]}</span>
        </span>
      ))}
    </div>
  );
}
