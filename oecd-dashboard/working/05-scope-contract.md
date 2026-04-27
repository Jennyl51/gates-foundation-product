# G5 · Scope Contract

> **REVISED — read [00-gate-revisions.md](./00-gate-revisions.md) first.**
> C3 split into C3a (must-ship 3-tier trust system) and C3b (optional external canonical-match attempt, time-boxed at 30 min). C2 first task now: country-name alias consolidation.


**Owners:** project-manager + agent-organizer
**Status:** awaiting Maxime's sign-off
**Reading rule:** This document is re-read every time scope creep tries to enter. Any addition not listed here requires an explicit P0/P1 swap.

---

## Locked decisions (from G1 → G4)

| | Decision |
|---|---|
| Persona | **OECD policy analyst (Samir)** as P0; Gates SrPO + Giving Tuesday Director as compatible secondary lenses, not designed-for |
| Decision pyramid | Diagnose → Direction → Mechanism → Lever → Caveat |
| UX framing | **Scaffold-first** (claim / evidence / caveat). Draft-prose toggle is stretch only. |
| Trust column | Required on every figure. Falls back to internal-only reconciliation if external canon scraping over-runs. |
| Infrastructure carry-over | Keep: `scripts/preprocess.py`, `lib/format.ts`, `lib/data.ts`, `components/section.tsx`, `components/card.tsx`, `components/stat-card.tsx`, `components/bar-list.tsx`, `components/timeseries-chart.tsx`, `components/column-chart.tsx`, design tokens in `globals.css`, layout shell, fonts. Throw away the page narratives and the donor-as-portrait pattern. |
| Binding rules | (1) Every screen ends in an action or scaffold, never just charts. (2) Every figure reconciles or is flagged. (3) No "trend" claim from <50 grants per year. (4) Domestic ≠ cross-border; never aggregate without showing the split. |

---

## P0 — must ship for the demo

| # | Artifact | Description | Definition of done |
|---|---|---|---|
| P0.1 | Decision Brief landing (`/`) | Replaces the v1 atlas hero. 3 KPI cards (total $, n foundations, % cross-border) **+ 3 ranked diagnoses**, each linking to its full analysis. The 3 diagnoses are auto-generated from the metric outputs (highest-magnitude misalignment, biggest YoY signal, most-concentrated risk slice). | Page renders the 3 diagnoses with action title + scaffold + drill link. Trust badge on every number. |
| P0.2 | SDG Misalignment view (`/diagnose/sdg`) | Heatmap of phil-share vs need-share per SDG goal. Each cell links to the per-goal scaffold (top funders, gap, comparator, caveat). Drives Scenario 1 (HLPF). | M1 + M2 implemented; SDR2024 join in place; scaffold per goal copy-pastable. |
| P0.3 | Country profile (`/country/[iso]`) | Auto-generated profile for any DAC donor country: size, sector mix, recipient mix, peer-comparator delta, cross-border share, channel mix. Drives Scenario 2 (DAC peer review). | M3 + M4 + M5 + M11 implemented; scaffold reads as a peer-review chapter draft. |
| P0.4 | Ad-hoc query (`/query`) | Free-form filter (sector × geo × year × marker) → one-page brief snippet. Drives Scenario 3 (parliamentary). | M6 + M7 + M8 implemented; brief snippet copy-pastable; <30-grant slices show the small-N badge. |
| P0.5 | Methodology + reconciliation (`/methodology`) | Carry-over from v1, extended with: trust matrix, SDR join notes, peer-group definition, Simpson's-flag explanation, citation block. | All 13 metrics documented with formula and rejection criteria; canonical reconciliation matrix listed (filled or honestly empty). |
| P0.6 | Preprocess extensions | `misalignment-sdg.json`, `country-profiles/{iso}.json`, `peer-comparators.json`, `hhi-by-slice.json`, `simpsons-flags.json`, `canonicals.json` | Each JSON is generated from the source CSV + joined externals; `preprocess.py` runs end-to-end without errors. |
| P0.7 | Scaffold generator | Reusable component that takes (claim, evidence rows, caveat) and renders the analyst-ready paragraph block with copy button. | Used on at least P0.1 / P0.2 / P0.3 / P0.4. |
| P0.8 | Trust badge component | Renders ✓ ±2% / ⚠ ±2-5% / ✗ unreconciled / ◔ internal-only. | Appears wherever a number is shown. |

## P1 — ship if time permits, deprioritize without guilt

| # | Artifact | Note |
|---|---|---|
| P1.1 | Tagged-vs-targeted view (`/diagnose/markers`) | Implements M9. Useful but not on the critical scenario path. |
| P1.2 | Donor concentration view (`/diagnose/concentration`) | Implements M10 + M12. Adds rigor; a single section on the methodology page may suffice. |
| P1.3 | Year-on-year shift dashboard | Already partly covered by P0.4's YoY slice; promote to its own page only if there's time. |
| P1.4 | Draft-prose toggle | Add `Generate prose` button on scaffolds. Only ship after persona-validation in demo. |

## P2 — explicitly deferred

- Choropleth world map
- Foundation comparison side-by-side
- Story-mode walkthrough / scrollytelling
- Animations / micro-interactions
- Sankey / treemap visuals
- ODA-vs-philanthropy comparison
- Mobile audit (target = desktop demo)

---

## Build sequence (ordered, with agent owners)

| # | Step | Lead agent | Inputs | Outputs |
|---|---|---|---|---|
| C1 | Pull SDR2024 + WDI baselines | data-researcher | external CSVs | `data/external/sdr2024.csv`, `wdi-baseline.csv` |
| C2 | Extend preprocess.py | (manual + descriptive-analytics) | OECD CSV + externals | new JSONs from P0.6 |
| C3 | Source tie-out + reconciliation matrix | source-tieout (per uploaded skill) + manual | new JSONs + OECD canonicals | `canonicals.json` filled or flagged |
| C4 | Validation (4-layer + Simpson's) | validation skill + logical_validator.py | all metrics | `working/06-validation-report.md`; halt on BLOCKER |
| C5 | Build P0.7 (scaffold component) + P0.8 (trust badge) | chart-maker + design:ux-copy | metric outputs | `components/scaffold.tsx`, `components/trust-badge.tsx` |
| C6 | Build P0.2 (`/diagnose/sdg`) | chart-maker | M1, M2 | page + heatmap chart |
| C7 | Build P0.3 (`/country/[iso]`) | chart-maker | M3, M4, M5, M11 | per-country page (50 DAC countries) |
| C8 | Build P0.4 (`/query`) | chart-maker (client component) | M6, M7, M8 | filter UI + scaffold |
| C9 | Build P0.1 (`/`) — depends on C6/C7/C8 outputs | chart-maker + storytelling | top-3 ranked diagnoses | new homepage |
| C10 | Build P0.5 (`/methodology`) extensions | data:ux-copy | metric specs | extended methodology page |
| C11 | Visual + UX critique pass | visual-design-critic + design:design-critique | all P0 pages | inline edits |
| C12 | Storyboard + 8-slide demo deck | story-architect + storytelling + deck-creator | screenshots + scaffolds | `outputs/demo-deck.pptx` |
| C13 | Final build + Vercel deploy + push to repo | (Maxime) | production code | live URL |

---

## Time-box estimate (post-G5)

| Block | Estimate | Risk |
|---|---|---|
| C1 — externals | 30 min | low |
| C2 — preprocess extensions | 60 min | medium (peer comparator + HHI) |
| C3 — reconciliation matrix | 45 min | **high** — may collapse to internal-only |
| C4 — validation | 30 min | low |
| C5 — scaffold + trust badge | 45 min | low |
| C6 — SDG diagnose page | 60 min | medium |
| C7 — country profile page | 45 min | low (template + data) |
| C8 — ad-hoc query page | 60 min | medium (client interactivity) |
| C9 — homepage rewrite | 30 min | low |
| C10 — methodology | 20 min | low |
| C11 — critique & polish | 45 min | medium |
| C12 — demo deck | 60 min | low |
| **Total** | **~9 hours** | |

If we are tight: drop P1.4 entirely; collapse C3 to internal-only reconciliation; combine C9 into C6+C7 by building the homepage as a stub that links to the three diagnose pages.

---

## Definition of done — every artifact, no exceptions

A page or component is **done** when:
1. It answers a P0 decision question end-to-end (open → scaffold → action → drill-down).
2. Every figure has a trust badge.
3. Every claim has the (claim, evidence, caveat) triple visible without scrolling.
4. Every chart has an **action title** ("Climate adaptation funding fell 18% in LDCs"), not a topic title ("Climate funding").
5. Validation has run and the artifact has no BLOCKER warnings.
6. visual-design-critic has run and any APPROVED-WITH-FIXES items are addressed.

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Time runs out on the trust matrix | Ship internal-only reconciliation; flag the gap honestly on methodology |
| SDR/WDI joins are messier than expected | Use the country name as join key with manual override list for the 5–10 known mismatches (e.g. "Korea" vs "Republic of Korea") |
| Demo deck dependency on screenshots from a deployed build | Take screenshots locally first; deploy is for the live demo URL only |
| Scope creep | This document. Re-read before saying "yes" to anything. |
| Persona drift back to "atlas" | The G1 binding condition. Every page must end in scaffold + action. If at C9 the homepage reads like an atlas, halt and re-spec. |

---

## Sign-off block

- [ ] **Maxime** — approved, start C1
- [ ] Persona locked: OECD policy analyst (P0)
- [ ] Scaffold-first UX confirmed
- [ ] Trust column required on every number
- [ ] Infrastructure carry-over confirmed
- [ ] P0/P1/P2 prioritization confirmed
- [ ] Deferred items will not be requested mid-build

---

## Carry-forward to construction phase

After Maxime signs off:
1. Spawn agent-organizer once at start of C1 to confirm agent assignments.
2. multi-agent-coordinator hands off between C-steps; context-manager preserves state across steps.
3. Workflow-orchestrator handles the C4/C11 quality gates (halt-on-blocker).
4. error-coordinator handles any preprocess or build failures.

If any construction step exceeds its time-box by >50%, halt and consult.
