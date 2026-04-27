/**
 * Glossary tooltip. Wraps an unfamiliar term with a dotted underline and an
 * instant-hover tooltip that explains it in plain language.
 *
 * Native <abbr title> works but most browsers delay the tooltip 1-2 seconds.
 * This implementation uses a CSS group-hover popup that appears immediately.
 * Falls back to title attribute for screen readers and right-click users.
 */

const GLOSSARY: Record<string, string> = {
  OECD: "Organisation for Economic Co-operation and Development. The Paris-based body that publishes the philanthropy database under the hood here.",
  DAC: "Development Assistance Committee. The OECD body whose 32 member countries are used as the peer-comparator group for country profiles.",
  LDC: "Least Developed Countries. The United Nations list of the 46 poorest countries, used as a need comparator on the country-tier misalignment lens.",
  HLPF: "High-Level Political Forum on Sustainable Development. The annual UN forum where progress on the 17 SDGs is reviewed.",
  SDG: "Sustainable Development Goals. The 17 goals adopted by United Nations member states in 2015, with target year 2030.",
  HHI: "Herfindahl-Hirschman Index. A standard measure of market concentration; values above 2,500 are considered highly concentrated.",
  Herfindahl: "A standard market-concentration measure: sum of squared donor shares times 10,000. Values above 2,500 are considered highly concentrated.",
  "cross-border": "A grant where the foundation gives outside its home country, as opposed to domestic philanthropy that stays inside the country.",
  domestic: "A grant where the foundation gives inside its own country, as opposed to cross-border philanthropy that crosses national lines.",
  "principal objective": "On a 0/1/2 scale, the highest score: the project's main aim is to advance the marker theme (gender, climate, etc.), not just a side benefit.",
  CRS: "Creditor Reporting System. The OECD's standardised sector-coding scheme that classifies every grant into one of 29 sectors.",
  scaffold: "A draft passage prepared in three parts (claim, evidence, caveat) that an analyst can copy, edit lightly, and ship into a brief.",
  "Simpson's paradox": "When a trend visible across an aggregate flips direction once you split by a subgroup. Here, when cross-border and domestic flows are pulled apart, several aggregate trends reverse.",
  "trust badge": "The small mark beside every figure: matches OECD canon within plus or minus 2 percent (Tier A), recomputed correctly internally only (Tier B), or small-sample slice that should be read directionally (Tier C).",
  "deflated": "Adjusted for inflation. Every dollar figure on this dashboard is in 2023 constant US dollars, which is why our totals will not match nominal-dollar press releases for the same period.",
};

export function Term({
  children,
  k,
}: {
  children: React.ReactNode;
  k?: string;
}) {
  const key = (k ?? (typeof children === "string" ? children : "")).trim();
  const explanation =
    GLOSSARY[key] ?? GLOSSARY[key.toLowerCase()] ?? GLOSSARY[key.toUpperCase()];

  if (!explanation) {
    return <>{children}</>;
  }

  return (
    <span className="relative inline-block group cursor-help" title={explanation}>
      <span
        className="underline decoration-dotted underline-offset-[3px] decoration-[var(--accent)]"
        style={{ textDecorationThickness: "1.5px" }}
      >
        {children}
      </span>
      <span
        role="tooltip"
        className={[
          "pointer-events-none absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2",
          "w-72 max-w-[80vw] px-3 py-2 rounded-md text-[13px] leading-snug",
          "bg-[var(--ink)] text-white shadow-lg",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible",
          "transition-opacity duration-100",
        ].join(" ")}
      >
        {explanation}
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid var(--ink)",
          }}
        />
      </span>
    </span>
  );
}

export function explain(term: string): string | undefined {
  return GLOSSARY[term] ?? GLOSSARY[term.toLowerCase()] ?? GLOSSARY[term.toUpperCase()];
}
