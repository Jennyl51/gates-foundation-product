# Session Resume

**Read this first if you are continuing this work in a new session.** It is the single source of truth for what has been decided, what has been built, and what remains. Re-readable in two minutes.

---

## What this project is

Spring 2026 Data Analytics Case Competition. Product Track. Build an interactive dashboard on the OECD private-philanthropy database (116k grants, $68B disbursed, 2020 to 2023, 506 foundations). Three judges evaluate: Diptesh Soni (Gates Foundation Senior Program Officer), Tomasso Larghetti (Giving Tuesday Director of Research), Samir Khan (OECD Policy Analyst). Evaluation criteria: insightfulness, dashboard design, functionality, creativity & depth.

Team: Maxime Chung, Ayah Elzein, Jenny Liang. Repo: github.com/Jennyl51/gates-foundation-product. Tech stack: Next.js 16, React 19, TypeScript, Tailwind 4. Dashboard reads pre-aggregated JSON files; no server runtime.

---

## Locked decisions (do not relitigate without explicit user request)

| Decision | Source |
|---|---|
| Primary user is **the OECD policy analyst** preparing a brief. Foundation strategists and Giving Tuesday researchers are compatible secondary readers, not designed-for. | G2 (working/02-personas.md) |
| UX is **scaffold-first**: every diagnosis page produces a draft passage with claim, evidence, caveat. Prose generation is a stretch only. | G2, G6 |
| **Trust badge** on every figure: Tier A (matches OECD canon ±2%) / Tier B (internal-only, recomputed correctly) / Tier C (small-sample, directional only). Default is Tier B. | G-revisions (working/00-gate-revisions.md) |
| Two complementary misalignment lenses, intentionally: world-level UN-goal lens + country-tier Least Developed Countries lens. | G-revisions |
| **Reader-mode parity rule**: every scaffold carries a hand-written "What this means for a foundation strategist" callout for the foundation reader. | G6, G-revisions |
| Hero language is **restrained / observational**, not salesy. The user explicitly rejected the original "turns six hours into a draft paragraph" framing as overselling. Current opening: *"A reading of the OECD philanthropy database, framed for the policy analyst's brief."* | Last user message |
| **Em-dashes, en-dashes, and bullet separators are removed** from user-visible text. The user finds them harder to read. Compound hyphens like "cross-border" stay. | Last user message |

---

## Build status

**Gate phase: complete (G1 through G6 + revisions).** Everything in `working/` is the decision trail.

| Gate | File | Verdict |
|---|---|---|
| G1 idea validation | working/01-idea-validation.md | GO with binding condition |
| G2 personas | working/02-personas.md | Samir locked as primary user |
| G3 decision questions | working/03-decision-questions.md | 12 P0/P1 questions, 5 explicit rejects |
| G4 metric spec | working/04-metric-spec.md | 8 P0 + 5 P1 metrics |
| G5 scope contract | working/05-scope-contract.md | 8 must-ship artifacts |
| G6 demo acceptance | working/06-demo-acceptance.md | Talk track + judge game-theory + v1 to v3 synthesis |
| G revisions | working/00-gate-revisions.md | Address the 4 real risks |

**Construction phase: substantially complete.** TypeScript clean. ESLint clean. Production build succeeds (verified earlier with 58 static pages generated).

| Step | What it produced | Done? |
|---|---|---|
| C1 | data/external/ (4 reference tables + alias map + README) | yes |
| C2 | scripts/preprocess.py extended; 5 new JSON files (misalignment, country profiles, peer comparators, concentration, Simpson's flags) | yes |
| C3a | components/trust-badge.tsx (3-tier system) | yes |
| C3b | external canonical scrape | skipped (sandbox cannot reach OECD site; Tier B is the default state) |
| C5 | components/scaffold.tsx (claim/evidence/caveat + KPI tile) | yes |
| C6 | app/diagnose/sdg/page.tsx (signature page, two lenses) | yes |
| C7 | app/country/page.tsx + app/country/[slug]/page.tsx (26 country profiles) | yes |
| C8 | app/explore upgraded with auto-generated brief snippet on every filter change | yes |
| C9 | app/page.tsx rewritten as Decision Brief homepage | yes |
| C10 | app/methodology/page.tsx with v3 trust-tier + LDC + Simpson's notes | yes |
| C11 | visual + UX critique pass | partial — color contrast and font sizes addressed, no full design review |
| C12 | demo deck (8 slides) | not started; talk track exists in working/06 |
| C13 | push to GitHub + Vercel deploy | not started — folder is a ZIP download, not a git clone |

---

## File map (what lives where)

```
oecd-dashboard/
  app/
    page.tsx                        # Decision Brief homepage (uses Scaffold + KPI + 3 DiagnosisCards)
    layout.tsx                      # Fonts, metadata. v3 metadata title applied.
    globals.css                     # v3 design tokens. darkened muted/subtle text for contrast.
    diagnose/sdg/page.tsx           # SIGNATURE PAGE. Two-lens misalignment with scaffolds.
    country/page.tsx                # Index of 26 OECD donor-country profiles.
    country/[slug]/page.tsx         # Per-country profile with peer-comparator scaffold.
    explore/page.tsx + explorer-client.tsx  # Filter UI + auto-generated brief snippet.
    methodology/page.tsx            # 11 method notes including Tier system, LDC lens, Simpson's flag.
    donors/                         # v1 leftover. demoted from nav. consider deleting.
    insights/                       # v1 leftover. demoted from nav. consider deleting.

  components/
    nav.tsx, footer.tsx             # Site chrome.
    section.tsx, card.tsx           # Layout primitives.
    stat-card.tsx                   # v1 stat tile.
    trust-badge.tsx                 # v3 Tier A/B/C disclosure badge.
    scaffold.tsx                    # v3 claim/evidence/caveat block + KPI tile.
    bar-list.tsx, timeseries-chart.tsx, column-chart.tsx  # Hand-rolled SVG charts.

  lib/data.ts                       # Server-side JSON loaders + types. v3 types appended.
  lib/format.ts                     # Number/USD formatters.
  scripts/preprocess.py             # CSV + 5 outside refs to ~20 small JSONs.

  data/raw/                         # GITIGNORED. drop OECD CSV here.
  data/external/                    # 5 reference files + README explaining sources.
  public/data/                      # ~20 pre-aggregated JSONs the dashboard reads.
                                    # Reconciliation gap to summary total: 0.03% (well under Tier B tolerance).

  working/
    SESSION-RESUME.md               # THIS FILE. read first.
    00-gate-revisions.md            # latest scope adjustments
    01..06.md                       # gate phase outputs
  HANDOFF.md                        # for Ayah and Jenny
```

---

## What remains, ranked by leverage

1. **Push to Jenny's GitHub repo.** Folder is a ZIP download (no `.git`), so GitHub Desktop cannot push from it. The user must clone the repo fresh, copy `oecd-dashboard/` over, commit, push. Sequence is in the previous turn's response. Cannot be done from inside the build environment without GitHub credentials.
2. **Run locally and click through.** `cd ~/Downloads/gates-foundation-product-main/oecd-dashboard && npm install && npm run dev` then `http://localhost:3000`. Highest-leverage thing left for the user.
3. **8-slide demo deck.** Talk track plotted to screens already exists in `working/06-demo-acceptance.md`. Build the deck from screenshots after the user runs it locally.
4. **Visual critique pass.** Have not yet rendered pages and screenshotted them. The Google-Fonts download is blocked in the build environment, so this requires the user's laptop.
5. **External SDG country-by-goal scores.** Sustainable Development Report 2024 CSV not reachable from sandbox. If swapped in on a laptop, the misalignment page gains a third lens.
6. **OECD canonical reconciliation matrix.** Would lift figures from Tier B to Tier A. Manual; longest-pole task. Skipped.
7. **Delete v1 leftovers** (`/donors`, `/insights`) once team confirms nothing links to them.

---

## Binding rules (re-read before any new construction work)

1. Every screen ends in a scaffold or a clear action. No bare charts.
2. Every figure on screen renders through `<TrustBadge>` or `<KPI>`. No bare numbers.
3. No "trend" claim from fewer than 50 grants per year per slice.
4. Domestic and cross-border philanthropy are never aggregated without showing the split.
5. Subsector is a first-class dimension on the explorer, not buried under sector.
6. Every scaffold has a hand-written "For a foundation strategist" callout (foundation-reader parity).
7. Em-dashes, en-dashes, bullet separators do not appear in user-visible text.
8. Hero language is restrained and observational, not salesy. Test: would this read as marketing copy? If yes, rewrite.

---

## Open questions parked for later

- Do we keep `/donors` (v1 portrait pages) or delete? Team decision.
- Should `/explore` and the country-profile peer comparator share a comparator engine? Refactor opportunity.
- Mobile audit not done; current design is desktop-first.

---

## What absolutely must not drift

- Persona stays OECD policy analyst. Do not narrow to a single foundation reader.
- Trust-tier system stays three-tier. Do not collapse to binary pass/fail.
- The two-lens misalignment design (world-level + LDC tier) stays. Do not drop one to "simplify."
- The G6 talk track is the demo plan. Do not improvise a new one without re-reading G6.
- Hero copy stays restrained. The user explicitly rejected the salesy version.

---

## How to resume cleanly in a new session

1. Read this file.
2. Skim `HANDOFF.md` for the developer-side overview.
3. Glance at `working/00-gate-revisions.md` for the latest scope changes.
4. Open `app/page.tsx` and `app/diagnose/sdg/page.tsx` to remind yourself of the v3 scaffold pattern in code.
5. Then ask the user what they want done next, before writing anything.
