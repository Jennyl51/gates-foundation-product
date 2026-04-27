"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Glossary tooltip. Wraps an unfamiliar term with a dotted underline and a
 * popup that appears on hover or focus.
 *
 * Implementation notes:
 *  - Client component using useState. CSS-only group-hover was unreliable
 *    under Tailwind 4 with arbitrary CSS variables, so we drive visibility
 *    explicitly.
 *  - Positions the popup above the term by default. Falls back to below if
 *    there is no room above.
 *  - Keyboard accessible via tabindex on the wrapper and onFocus/onBlur.
 *  - Native title attribute kept as fallback for screen readers.
 */

const GLOSSARY: Record<string, string> = {
  OECD: "Organisation for Economic Co-operation and Development. The Paris-based body that publishes the philanthropy database used here.",
  DAC: "Development Assistance Committee. The OECD body whose 32 member countries are used as the peer-comparator group for country profiles.",
  LDC: "Least Developed Countries. The United Nations list of the 46 poorest countries, used as a need comparator on the country-tier misalignment lens.",
  HLPF: "High-Level Political Forum on Sustainable Development. The annual UN forum where progress on the 17 SDGs is reviewed.",
  SDG: "Sustainable Development Goals. The 17 goals adopted by United Nations member states in 2015, with target year 2030.",
  HHI: "Herfindahl-Hirschman Index. A standard measure of market concentration; values above 2,500 are considered highly concentrated.",
  Herfindahl:
    "A standard market-concentration measure: sum of squared donor shares times 10,000. Values above 2,500 are considered highly concentrated.",
  "cross-border":
    "A grant where the foundation gives outside its home country, as opposed to domestic philanthropy that stays inside the country.",
  domestic:
    "A grant where the foundation gives inside its own country, as opposed to cross-border philanthropy that crosses national lines.",
  "principal objective":
    "On a 0/1/2 scale, the highest score. The project's main aim is to advance the marker theme (gender, climate, etc.), not just a side benefit.",
  CRS: "Creditor Reporting System. The OECD's standardised sector-coding scheme that classifies every grant into one of 29 sectors.",
  scaffold:
    "A draft passage prepared in three parts (claim, evidence, caveat) that an analyst can copy, edit lightly, and ship into a brief.",
  "Simpson's paradox":
    "When a trend visible across an aggregate flips direction once you split by a subgroup. Here, when cross-border and domestic flows are pulled apart, several aggregate trends reverse.",
  "trust badge":
    "The small mark beside every figure. Matches OECD canon within plus or minus 2 percent (Tier A), recomputed correctly internally only (Tier B), or small-sample slice that should be read directionally (Tier C).",
  deflated:
    "Adjusted for inflation. Every dollar figure on this dashboard is in 2023 constant US dollars, which is why our totals will not match nominal-dollar press releases for the same period.",
  misalignment:
    "Where philanthropic dollars per goal differ materially from where the world is most behind on that goal. Positive bars are over-funded relative to need; negative bars are under-funded.",
  philanthropy:
    "Private giving from a foundation, separate from government foreign aid (ODA). The OECD database tracked here covers about 506 foundations.",
};

export function Term({
  children,
  k,
}: {
  children: React.ReactNode;
  k?: string;
}) {
  const [open, setOpen] = useState(false);
  const [placeAbove, setPlaceAbove] = useState(true);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const key = (k ?? (typeof children === "string" ? children : "")).trim();
  const explanation =
    GLOSSARY[key] ?? GLOSSARY[key.toLowerCase()] ?? GLOSSARY[key.toUpperCase()];

  useEffect(() => {
    if (!open || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setPlaceAbove(rect.top > 200);
  }, [open]);

  if (!explanation) {
    return <>{children}</>;
  }

  return (
    <span
      ref={wrapRef}
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      title={explanation}
      style={{
        position: "relative",
        display: "inline-block",
        cursor: "help",
        outline: "none",
      }}
    >
      <span
        style={{
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textDecorationThickness: "1.5px",
          textUnderlineOffset: "3px",
          textDecorationColor: "var(--accent)",
        }}
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            zIndex: 100,
            left: "50%",
            transform: "translateX(-50%)",
            [placeAbove ? "bottom" : "top"]: "calc(100% + 8px)",
            width: "min(20rem, 80vw)",
            padding: "10px 12px",
            borderRadius: "6px",
            fontSize: "13px",
            lineHeight: "1.5",
            background: "var(--ink)",
            color: "white",
            fontStyle: "normal",
            fontWeight: 400,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            pointerEvents: "none",
            whiteSpace: "normal",
          }}
        >
          {explanation}
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              [placeAbove ? "top" : "bottom"]: "100%",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              [placeAbove ? "borderTop" : "borderBottom"]:
                "6px solid var(--ink)",
            }}
          />
        </span>
      )}
    </span>
  );
}

export function explain(term: string): string | undefined {
  return (
    GLOSSARY[term] ??
    GLOSSARY[term.toLowerCase()] ??
    GLOSSARY[term.toUpperCase()]
  );
}
