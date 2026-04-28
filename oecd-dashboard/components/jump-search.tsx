"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Searchable jump-to bar in the nav. Loads two compact indexes from
 * public/data on first focus (so the page does not pay for them on initial
 * render), fuzzy-matches input across foundation names and donor-country
 * names, and navigates to the matched profile on Enter or click.
 */

type Hit = {
  kind: "foundation" | "country";
  label: string;
  href: string;
  sub?: string;
};

export function JumpSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<Hit[] | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Lazy-load the index the first time the user focuses the input
  async function ensureIndex() {
    if (index) return;
    try {
      const [donorsRes, countriesRes] = await Promise.all([
        fetch("/data/top-donors.json"),
        fetch("/data/peer-comparators.json"),
      ]);
      const donors = (await donorsRes.json()) as {
        name: string;
        slug: string;
        donor_country: string | null;
      }[];
      const countries = (await countriesRes.json()) as {
        country: string;
        slug: string;
      }[];
      const hits: Hit[] = [
        ...donors.map<Hit>((d) => ({
          kind: "foundation",
          label: d.name,
          href: `/donors/${d.slug}`,
          sub: d.donor_country ?? undefined,
        })),
        ...countries.map<Hit>((c) => ({
          kind: "country",
          label: c.country,
          href: `/country/${c.slug}`,
          sub: "Country profile",
        })),
      ];
      setIndex(hits);
    } catch {
      setIndex([]);
    }
  }

  // Click outside to close
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Cmd-K / Ctrl-K to focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!index || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const scored = index
      .map((h) => {
        const label = h.label.toLowerCase();
        let score = 0;
        if (label === q) score = 100;
        else if (label.startsWith(q)) score = 50;
        else if (label.includes(q)) score = 25;
        else return null;
        return { ...h, score };
      })
      .filter((x): x is Hit & { score: number } => x !== null)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 8);
  }, [index, query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      go(results[Math.min(activeIdx, results.length - 1)].href);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapRef} className="relative w-[260px]">
      <input
        ref={inputRef}
        type="search"
        placeholder="Jump to a foundation or country"
        value={query}
        onFocus={() => {
          setOpen(true);
          ensureIndex();
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIdx(0);
        }}
        onKeyDown={onInputKey}
        aria-label="Search foundations and countries"
        className="w-full h-9 px-3 pr-10 text-[13px] rounded-full border border-[var(--border-strong)] bg-white text-ink placeholder:text-[var(--subtle)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
      />
      <kbd
        aria-hidden
        className="hidden md:inline-flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 h-5 px-1.5 text-[10px] font-mono rounded border border-[var(--border-strong)] text-[var(--muted)] pointer-events-none"
      >
        ⌘K
      </kbd>
      {open && query.trim() && (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-md border border-[var(--border-strong)] bg-white shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-[13px] text-[var(--muted)] italic">
              {index === null ? "Loading…" : "No matches. Try part of a name."}
            </div>
          ) : (
            <ul role="listbox">
              {results.map((h, i) => {
                const active = i === activeIdx;
                return (
                  <li
                    key={`${h.kind}-${h.href}`}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      onClick={() => go(h.href)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={[
                        "w-full text-left px-3 py-2 transition-colors block",
                        active
                          ? "bg-[var(--primary-soft)]"
                          : "hover:bg-[var(--paper)]",
                      ].join(" ")}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[14px] text-ink truncate">
                          {h.label}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] shrink-0">
                          {h.kind === "country" ? "country" : "foundation"}
                        </span>
                      </div>
                      {h.sub && (
                        <div className="text-[12px] text-[var(--muted)]">
                          {h.sub}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
