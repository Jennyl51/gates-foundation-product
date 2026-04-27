# OECD Decision Atlas — Handoff (v3)

Hi Ayah and Jenny — this document explains the v3 dashboard sitting in this repo, what changed from the original create-next-app scaffold, and what's left for either of you to pick up.

---

## What this is now

A Next.js 16 / React 19 dashboard built on the OECD philanthropy spreadsheet (116k grants, $68B disbursed, 2020–2023). The brief said "build something user-friendly for policymakers and foundation leaders." We narrowed the primary user to the **OECD policy analyst** (Samir, the third of the three judges) because his job — writing briefs from the spreadsheet — is exactly what this tool is set up to make ten times faster. Foundation strategists are a compatible secondary reader: every screen carries a one-line "What this means for a foundation strategist" callout so the Gates judge never feels excluded.

The defining product idea: **the dashboard does not just expose the data, it produces the analyst's deliverable**. Every diagnosis page renders a ready-to-paste scaffold (claim → evidence → caveat) with a trust badge on every figure. Whatever bare numbers used to live on the page now live inside scaffolds.

---

## How to run it locally

```bash
cd oecd-dashboard
npm install
python3 scripts/preprocess.py   # only if data changes
npm run dev
# → http://localhost:3000
```

The preprocess script needs the raw 60MB CSV at `data/raw/oecd-funding.csv`. That file is gitignored. If the repo doesn't have it, drop it in from the original case-comp upload and rerun.

---

## What's in the repo

```
oecd-dashboard/
├── app/
│   ├── page.tsx                       # Decision Brief homepage (3 ranked diagnoses + LDC scaffold)
│   ├── layout.tsx                     # Root layout — fonts, nav, footer
│   ├── globals.css                    # Design tokens (palette + type)
│   ├── diagnose/sdg/page.tsx          # Goal-alignment diagnosis (signature page)
│   ├── country/page.tsx               # Country profile index
│   ├── country/[slug]/page.tsx        # Per-country profile w/ DAC peer comparison
│   ├── explore/                       # Filterable explorer with auto-generated brief snippet
│   ├── donors/                        # v1 donor-portrait pages (kept for now, demoted in nav)
│   ├── insights/                      # v1 markers + SDG mash-up (kept; lower priority)
│   └── methodology/                   # Trust-tier explanation, caveats, glossary
├── components/
│   ├── trust-badge.tsx                # ✓/◔/⚠ tier badge — used wherever a number renders
│   ├── scaffold.tsx                   # Claim/evidence/caveat block + KPI tile
│   ├── nav.tsx, footer.tsx, section.tsx, card.tsx, stat-card.tsx
│   ├── bar-list.tsx, timeseries-chart.tsx, column-chart.tsx
├── lib/
│   ├── data.ts                        # Server-side JSON loaders + types
│   └── format.ts                      # USD / number formatters
├── scripts/
│   └── preprocess.py                  # CSV + 5 outside refs → ~20 small JSON files
├── data/
│   ├── raw/                           # gitignored — drop the OECD CSV here
│   └── external/                      # 5 small reference tables w/ README
└── public/data/                       # ~20 pre-aggregated JSONs the dashboard reads
└── working/                           # the planning docs that drove v3
    ├── 00-gate-revisions.md           # latest scope adjustments
    ├── 01-idea-validation.md          # competitive teardown + go/no-go
    ├── 02-personas.md                 # Samir + scenarios
    ├── 03-decision-questions.md       # 12 P0/P1 questions, 5 rejects
    ├── 04-metric-spec.md              # 13 metrics with formulas + guardrails
    ├── 05-scope-contract.md           # build sequence
    └── 06-demo-acceptance.md          # judge questions + 5-min talk track
```

The `working/` folder is the most important thing to read after this handoff. It contains the entire decision-trail from the original brief to v3 — what was rejected, what was kept, what was deliberately simplified.

---

## v3 page status

| Page | Status | What it does |
|---|---|---|
| `/` Decision brief | ✅ Done | Homepage with 3 ranked diagnoses + counter-intuitive LDC scaffold |
| `/diagnose/sdg` | ✅ Done | Two-lens goal-alignment diagnosis (world + LDC tier) — signature page |
| `/country` | ✅ Done | Country profile index split into stable / directional groups |
| `/country/[slug]` | ✅ Done | 26 OECD donor-country profiles, each with DAC peer-comparator scaffold |
| `/explore` | ✅ Done (v3 upgrade) | Filter UI now produces an auto-generated brief snippet at top with copy button |
| `/methodology` | ✅ Done | Trust-tier explanation, two-lens method note, Simpson's-flag note, glossary |
| `/donors` and `/donors/[slug]` | ⚠ v1 leftover | Atlas-style donor portraits — kept temporarily; demote or delete |
| `/insights` | ⚠ v1 leftover | Markers + SDG view — superseded by `/diagnose/sdg`; keep or delete |

The two v1 pages still in the codebase do not appear in the main nav. They work but they don't fit the v3 framing. Either of you can delete them when you're confident nothing links there from a bookmark.

---

## The three things to know about the data

1. **Trust tier on every figure.** ✓ Tier A means the number matches OECD canon within ±2%. ◔ Tier B (the default state today) means we did the math correctly from the source spreadsheet but have not yet matched against an official canonical figure. ⚠ Tier C means the slice has fewer than 50 grants; treat directionally. The badge UI is `<TrustBadge tier="A|B|C" />`.

2. **Two mis-alignment lenses, intentionally.** The world-level lens compares philanthropy share per UN goal against the world's distance-to-target on that goal. The country-tier (Least Developed Countries) lens compares dollars to LDCs against the population share LDCs hold inside the named-recipient set. They can disagree, and that's a feature.

3. **Simpson's-paradox flags exist for a reason.** Aggregating across cross-border + domestic philanthropy can hide real reversals. The most important live example: education funding in Asia rose overall, but cross-border fell while domestic surged. The dashboard surfaces three such reversals; do not ignore them.

---

## What's been deliberately skipped (you can pick any of these up)

- **Per-country reconciliation to OECD canonical totals.** The trust badge is Tier B everywhere — bumping figures to Tier A requires matching to OECD's own published tables. Most-impactful single project for credibility.
- **A `/diagnose/concentration` page.** The data is in `public/data/concentration.json` (top 300 single-funder slices). A page would render it as a sortable table with HHI bands.
- **A `/diagnose/simpsons` page.** Same idea — `simpsons-flags.json` is ready, just needs a page that lists the flagged slices and shows the cross-border-vs-domestic decomposition for each.
- **A demo deck for the judges.** The 5-minute talk track is fully written in `working/06-demo-acceptance.md`. Use the screenshots from the running dashboard.
- **External SDG country-level scores.** The build environment couldn't reach the SDR2024 download. Run `curl https://dashboards.sdgindex.org/downloads` from a normal laptop; replace `data/external/sdg-need-scores.json` with the country-level version; the misalignment page can then add a country-level lens.

---

## Design system, in two minutes

| Token | Use |
|---|---|
| `--primary` (#0F4C5C) | Brand teal — CTAs, primary bars |
| `--accent` (#C77B3D) | Eyebrows, accent bars, decorative numbers |
| `--forest` (#4A7C59) | Foundation-reader callouts, positive bars |
| `--alert` (#B7472A) | Cautions, removals, negative deltas |
| `--paper` (#F8F5EE) | Page background |
| `--surface` (#FFFFFF) | Cards |

Type pairing: Source Serif 4 for display + Geist for body + Geist Mono for codes. Don't switch.

---

## Push and deploy

The repo is set up to deploy on Vercel as a static export — no server code, no API. Pushing to GitHub and connecting Vercel to this repo with `oecd-dashboard/` as the project root is the entire deployment path.

If you've cloned this from a ZIP rather than `git clone`, **GitHub Desktop won't be able to push** because the folder isn't a git repository. The fix is to clone Jenny's repo fresh from GitHub Desktop and copy the `oecd-dashboard/` folder over.

---

## Questions that need decisions from the team

1. Do we keep `/donors` and `/insights`? They don't hurt — they just don't fit the framing.
2. Who owns the demo? The talk track in `working/06-demo-acceptance.md` is 5 minutes plotted to screens. Run through it as-is or remix.
3. If the case judges are split between policy and foundation lenses (which I think they will be), do we want a one-screen "for foundation strategists" mode — a toggle that re-frames the same data — for v4? Not for the comp, but worth noting.

— Maxime
