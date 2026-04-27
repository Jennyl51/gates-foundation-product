import Link from "next/link";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/", label: "Overview" },
  { href: "/explore", label: "Explore" },
  { href: "/donors", label: "Donors" },
  { href: "/insights", label: "Insights" },
  { href: "/methodology", label: "Methodology" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur border-b border-[var(--border)]">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 flex items-center justify-between h-14">
        <Link href="/" className="flex items-baseline gap-3">
          <Logo />
          <span className="font-serif text-[18px] leading-none text-ink">
            OECD <span className="italic text-[var(--primary)]">Philanthropy Atlas</span>
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-7 text-[14px] text-[var(--muted)]">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-[var(--ink)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden sm:block text-[12px] text-[var(--subtle)] font-mono">
          2020 – 2023 · USD constant
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="11" cy="11" r="10" stroke="var(--primary)" strokeWidth="1.5" />
      <ellipse cx="11" cy="11" rx="4" ry="10" stroke="var(--primary)" strokeWidth="1.2" />
      <line x1="1" y1="11" x2="21" y2="11" stroke="var(--primary)" strokeWidth="1.2" />
      <circle cx="11" cy="11" r="2.4" fill="var(--accent)" />
    </svg>
  );
}
