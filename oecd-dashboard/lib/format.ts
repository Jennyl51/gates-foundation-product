// Number / currency formatters used across the dashboard.
// Values from the OECD dataset are USD millions (2023 deflated).

export function formatUSD(usdMillions: number, opts?: { compact?: boolean }): string {
  if (usdMillions == null || Number.isNaN(usdMillions)) return "—";
  const compact = opts?.compact ?? true;

  // millions -> billions / millions / thousands
  const abs = Math.abs(usdMillions);
  if (compact) {
    if (abs >= 1000) {
      return `$${(usdMillions / 1000).toFixed(usdMillions / 1000 >= 10 ? 1 : 2)}B`;
    }
    if (abs >= 1) {
      return `$${usdMillions.toFixed(usdMillions >= 100 ? 0 : usdMillions >= 10 ? 1 : 1)}M`;
    }
    if (abs >= 0.001) {
      return `$${(usdMillions * 1000).toFixed(0)}k`;
    }
    return `$${(usdMillions * 1_000_000).toFixed(0)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
  }).format(usdMillions * 1_000_000);
}

export function formatNumber(n: number, digits = 0): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

export function formatPercent(n: number, digits = 0): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function pct(part: number, total: number, digits = 1): string {
  if (!total) return "—";
  return `${((part / total) * 100).toFixed(digits)}%`;
}

// "Bilateral, unspecified" / "South of Sahara, regional" etc are official
// OECD labels for grants without a single recipient country. Surface them
// honestly with a hint.
export function isUnspecifiedCountry(name: string | null | undefined): boolean {
  if (!name) return false;
  const n = name.toLowerCase();
  return (
    n.includes("unspecified") ||
    n.includes("regional") ||
    n.startsWith("global") ||
    n === "developing countries, unspecified"
  );
}
