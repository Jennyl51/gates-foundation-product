import type { ReactNode } from "react";
import { TrustBadge } from "./trust-badge";

/**
 * Scaffold. the analyst-ready draft block that anchors every diagnosis page.
 *
 *   <Scaffold
 *     claim="Philanthropy over-funds Health by 14 percentage points relative to need."
 *     evidence={[
 *       "18.9% of tagged disbursement goes to Health, the largest share of any UN goal.",
 *       "Health represents 4.9% of the world's distance-to-target across all 17 goals.",
 *       "The 14 pp gap is the largest over-allocation in the dataset.",
 *     ]}
 *     caveat="World-average comparator. A country-level lens would surface different priorities."
 *     foundationLens="For a foundation strategist: Health concentration is durable. entering Goal 9 or Goal 14 is contrarian and high-leverage."
 *     trustTier="B"
 *   />
 *
 * The "foundationLens" line is the binding G6 reader-mode parity rule.
 */
export function Scaffold({
  eyebrow,
  claim,
  evidence,
  caveat,
  foundationLens,
  trustTier = "B",
  source,
  children,
}: {
  eyebrow?: string;
  claim: ReactNode;
  evidence: (string | ReactNode)[];
  caveat?: ReactNode;
  foundationLens?: ReactNode;
  trustTier?: "A" | "B" | "C";
  source?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-5 md:p-7">
      {eyebrow && (
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--accent)] mb-3 flex items-center gap-2">
          <span>{eyebrow}</span>
          <TrustBadge tier={trustTier} />
        </div>
      )}

      {/* Claim */}
      <h3 className="font-serif text-[20px] md:text-[24px] leading-snug text-ink mb-4">
        {claim}
      </h3>

      {/* Evidence */}
      <ol className="space-y-3 mb-5 text-[15px] md:text-[16px] text-ink leading-relaxed">
        {evidence.map((e, i) => (
          <li key={i} className="flex gap-3">
            <span className="font-mono text-[12px] text-[var(--muted)] mt-1 shrink-0 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{e}</span>
          </li>
        ))}
      </ol>

      {/* Optional richer evidence (charts, tables) */}
      {children && <div className="my-4">{children}</div>}

      {/* Foundation-reader parity callout. binding G6 rule */}
      {foundationLens && (
        <div className="mt-5 pt-4 border-t border-[var(--border)]">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--forest)] mb-2">
            For a foundation strategist
          </div>
          <p className="text-[14px] md:text-[15px] text-ink leading-relaxed italic">
            {foundationLens}
          </p>
        </div>
      )}

      {/* Caveat. the "what could change this" line */}
      {caveat && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--alert)] mb-2">
            Caveat
          </div>
          <p className="text-[14px] text-[var(--muted)] leading-relaxed">{caveat}</p>
        </div>
      )}

      {/* Source */}
      {source && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] text-[11px] font-mono text-[var(--subtle)] uppercase tracking-wider">
          {source}
        </div>
      )}
    </div>
  );
}

/**
 * KPI tile that renders through the trust badge. used on country profiles
 * and the homepage decision brief. Replaces bare-number tiles.
 */
export function KPI({
  label,
  value,
  sub,
  trustTier = "B",
  accent = false,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  trustTier?: "A" | "B" | "C";
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-md p-5 md:p-6 border",
        accent
          ? "bg-[var(--primary)] border-[var(--primary)] text-white"
          : "bg-[var(--surface)] border-[var(--border)]",
      ].join(" ")}
    >
      <div
        className={[
          "font-mono text-[11px] tracking-[0.16em] uppercase flex items-center gap-2",
          accent ? "text-white/70" : "text-[var(--accent)]",
        ].join(" ")}
      >
        <span>{label}</span>
        <TrustBadge tier={trustTier} />
      </div>
      <div
        className={[
          "font-serif tabular-nums leading-none mt-2",
          "text-[34px] md:text-[44px]",
          accent ? "text-white" : "text-ink",
        ].join(" ")}
      >
        {value}
      </div>
      {sub && (
        <div
          className={[
            "mt-2 text-[13px] md:text-[14px] leading-snug",
            accent ? "text-white/85" : "text-[var(--muted)]",
          ].join(" ")}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
