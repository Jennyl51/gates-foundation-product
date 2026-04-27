# Gate Revisions — addressing the four real risks

**Reading order:** read this document *first*, then the original gate files (01–06). This file lists what changed and why; the original gate files are amended in place where the change is short, and otherwise are left intact with this doc as the override.

---

## Risk 1 · World-average vs country-specific need scores

**The problem.** The Sustainable Development Report's country-by-goal CSV could not be reached from this build environment, so the "need" comparator hard-coded in `data/external/sdg-need-scores.json` is world-average only. A misalignment claim built on world averages is defensible but not surgical — it cannot say "Bangladesh is most behind on water and philanthropy is under-funding water there."

**The fix.** Add a second misalignment lens using a comparator that we *do* have data for: the United Nations list of Least Developed Countries (already captured in C1).

The two lenses become:

| Lens | What it answers | Comparator |
|---|---|---|
| **World-level (kept from original plan)** | "Globally, which UN goals get philanthropic funding out of proportion to where the world is most behind?" | World-average SDG scores per goal |
| **Country-tier (new)** | "Do philanthropic dollars follow people in poorest countries, or do they cluster in better-off recipients?" | Share of dollars to Least Developed Countries vs. share of LDCs in total recipient population |

The country-tier lens uses only inputs we already have (the OECD recipient column, the LDC list, the population table). It cannot be undermined by the absence of country-by-goal data. It produces a single, defensible claim that no other case-comp team will have. **Promoted to a P0 metric (M1b).**

**Plan-time impact.** Adds about 15 minutes to C2 (one new aggregation in preprocess.py). No UI cost — the same `/diagnose/sdg` page renders both lenses with a small toggle.

**G4 update.** A new metric is added; see "Updated metric list" below.

---

## Risk 2 · Persona narrowed harder than the brief

**The problem.** The case brief said "policymakers and foundation leaders." We anchored on the OECD policy analyst (Samir). Two of three judges are from foundation-side organisations (Gates and Giving Tuesday). If the Gates judge feels the tool is alien to him, we lose his vote on insightfulness — which is one of the four explicit evaluation criteria.

**The fix.** Add a **reader-mode parity rule** to the binding rules in G6:

> Every page that produces a draft scaffold must also produce a one-line **"What this means for a foundation strategist"** callout. The callout reframes the same finding for the foundation reader without re-running any data. It is a short, hand-written line per scaffold type, not generated.

That's a concrete, low-cost commitment (about 5 minutes per page during the UI build). The dashboard remains designed-for-Samir; the reader-mode line ensures the foundation reader is never surprised or excluded.

**G6 update.** Reader-mode parity rule added to the "Final binding rules" list. Story-architect agent picks up this rule when writing scaffolds.

**Talk-track update.** During the live demo I will demonstrate the parity rule on at least one page — pointing out the foundation-reader callout — to pre-empt any "this isn't for me" reaction from the Gates judge.

---

## Risk 3 · Trust badge depends on data we may not be able to reach

**The problem.** The "trust column" — the small mark next to every figure that confirms it agrees with OECD's own published number to within ±2% — is the credibility column. Building it requires matching our internal aggregations to OECD's published canonical figures. If the build environment cannot reach OECD's website, the column collapses to internal-only.

**The fix.** Redesign the trust column as a **three-tier disclosure** rather than a binary pass/fail. This works without external data; if the external data does become available in time, it slots in cleanly.

| Tier | Mark | Meaning |
|---|---|---|
| **Tier A** | ✓ | This number agrees with OECD's published canonical figure within ±2% |
| **Tier B** | ◔ | We cannot match this number to a single OECD published figure, but it is recomputed correctly from documented aggregation rules and reconciles internally to the source spreadsheet |
| **Tier C** | ⚠ | Small-sample slice (fewer than 50 grants, or guardrail tripped) — treat as directional only |

Tier B is the **default state** if no external canonical reference is available — and it is still credible, because we say exactly what we did and the math reconciles to the source CSV. Tier A is added wherever a canonical match exists. Tier C is automatic from the metric guardrails we already specified.

**Plan-time impact.** Splits C3 into:

| Step | Description | Time-box |
|---|---|---|
| **C3a** | Implement the three-tier system: every number rendered through the trust-tier component, defaults to Tier B with internal reconciliation, Tier C automatic on guardrail trip | 30 min |
| **C3b** | Time-boxed attempt at external canonical scrape; whatever matches go to Tier A, whatever doesn't stays at Tier B; halt at 30 min regardless of completeness | 30 min |

Total time still ≤ 60 min. Critically, **C3a alone is sufficient for a defensible demo**. C3b is upside, not blocker.

---

## Risk 4 · Country-name aliases not unified

**The problem.** "Tanzania" vs "United Republic of Tanzania", "Korea" vs "Republic of Korea", "DR Congo" vs "Democratic Republic of the Congo" — every join we write will hit this long tail. The four reference files in C1 each have their own override section, but there is no single alias map.

**The fix.** Make consolidating these aliases the **first task in C2**, before any aggregation.

Output: `data/external/country-aliases.json` with a single map: `{ canonical_name: [alias1, alias2, ...] }`. Every downstream join goes through it. Unmatched names are logged to stderr so we can see the long tail and patch it.

**Plan-time impact.** ~10 minutes added to C2. Worth it — every later step becomes safer.

---

## Updated metric list (G4 amendment)

| ID | Status | Change |
|---|---|---|
| M1 | unchanged | World-level Misalignment Index, world-average SDG scores |
| **M1b** | **NEW · P0** | Country-tier Misalignment: dollar share to Least Developed Countries vs LDC population share |
| M2 | unchanged | Trend slope per UN goal |
| M3 | unchanged | Country funding profile |
| M4 | unchanged | Peer-comparator delta vs DAC average |
| M5 | unchanged | Cross-border share |
| M6 | **clarified** | Ad-hoc slice now explicitly includes subsector dimension (per G6 finding) |
| M7 | unchanged | Year-over-year change with significance flag |
| **M8** | **redesigned** | Trust column: 3-tier (Tier A canonical-match, Tier B internal-only, Tier C small-sample) |
| M9–M13 | unchanged | nice-to-have metrics; same specs |

---

## Updated build sequence (G5 amendment)

| Step | Description | Status |
|---|---|---|
| C1 | Pull outside reference data | **done** |
| **C2** | Extend preprocess.py — first task: consolidate country-aliases.json — adds M1b alongside M1 | next |
| **C3a** | Implement three-tier trust system; default Tier B everywhere | replaces original C3 |
| **C3b** | Attempt external canonical match for Tier A — 30 min time-box | new, optional |
| C4 | Validation pass | unchanged |
| C5–C13 | UI build, critique, deck, deploy | unchanged but reader-mode parity rule applies to every scaffold |

---

## Updated binding rules (G6 amendment)

The four original binding rules remain. **Two new rules** are added:

5. *(reaffirmed)* Subsector is a first-class dimension on the ad-hoc query — not buried under sector
6. **NEW** — Every scaffold has a "What this means for a foundation strategist" one-line callout, written by hand, never generated, that reframes the same finding for the foundation reader without re-running data
7. **NEW** — Every figure on screen renders through the trust-tier component (Tier A / B / C). No bare numbers. No exceptions.

---

## Net effect of the revisions

- **Risks named in the validation pass have concrete fixes**, not just acknowledgements.
- **One new must-ship metric** (M1b) — the country-tier misalignment, which adds a defensible claim that does not depend on data we cannot reach.
- **Trust column is now resilient**: a defensible Tier B baseline regardless of whether external scraping works, with Tier A as upside.
- **Foundation reader is no longer at risk of feeling alienated** — every scaffold carries the parity callout.
- **Country-name long tail is addressed up front** — no surprise mid-build.

**Time budget impact:** ~25 minutes added across C2, C3a, and the per-scaffold callout. Well inside the slack we banked from the gate phase. **No P0 items dropped.**

---

## Sign-off

- [x] Risk 1 fixed — added M1b, world-level Misalignment retained as M1
- [x] Risk 2 fixed — reader-mode parity rule added to binding rules
- [x] Risk 3 fixed — trust column redesigned as 3-tier; C3 split into C3a (must) + C3b (optional)
- [x] Risk 4 fixed — country-aliases consolidation made first task in C2
- [ ] **Maxime** — approved, start C2

---

## Forward to C2

C2 starts with the alias consolidation, then the new aggregations. I will run the preprocess script end-to-end and report (a) the new JSONs produced, (b) the unmatched-country log, (c) any guardrail trips that suggest data-quality issues we should know about. I will halt and report if anything in this revision document needs to change.
