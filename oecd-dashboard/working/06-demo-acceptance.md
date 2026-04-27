# G6 · Demo Acceptance + Storyboard + Knowledge Synthesis

> **REVISED — read [00-gate-revisions.md](./00-gate-revisions.md) first.**
> Two new binding rules added: (6) every scaffold carries a hand-written "What this means for a foundation strategist" callout for reader-mode parity, (7) every figure renders through the trust-tier component — no bare numbers.


**Owners:** ux-researcher (judge game-theory), story-architect (storyboard), knowledge-synthesizer (v1→v3 mapping)
**Brief:** Final gate before construction. Pressure-test the P0 plan against the actual judges, write the talk track *before* the code, and lock down what carries from v1.

---

## Part A — Judge game-theory

The judges are not generic. Each will probe a different fault line. Below: their likely questions, the screen that answers, and the failure mode if our screen is weak.

### J1 — Diptesh Soni · Senior Program Officer, Gates Foundation

**Lens:** "Is this useful for a real foundation strategist on Monday morning?"

| # | Likely question | Screen that answers | Failure mode if weak |
|---|---|---|---|
| 1 | "How does Gates compare to peer foundations on sector mix?" | `/country/usa` (filtered to Gates) + peer-comparator delta (M4) | Generic "top donors" chart with no benchmark |
| 2 | "Where is the whitespace for a foundation our size?" | `/diagnose/sdg` Misalignment Index (M1) — but reframed for funder lens | Misalignment shown only in policy framing, not actionable for funder |
| 3 | "Your $18.9B figure for Gates — does it reconcile to what we self-report?" | Trust badge (M8) on every Gates figure | Bare number with no reconciliation = instant credibility loss |
| 4 | "Polio is health, but your sector list lumps both at $30B — that's misleading" | Subsector drill-down (M6 with sector + subsector filter) | Sector totals presented without the option to drill |
| 5 | "Can I export this for my team?" | "Copy scaffold" button on every screen + CSV download from `/query` | No export = "demo only" perception |
| 6 | "Does this change anyone's allocation?" | Top-3 ranked diagnoses on `/` with action verbs | Page reads as observation, not action |

**Defensibility risk:** Diptesh has been inside the data we're showing. He will spot inconsistencies fast. Every Gates-related figure must reconcile or be flagged.

---

### J2 — Tomasso Larghetti · Director of Research, Giving Tuesday

**Lens:** "Is this a publishable research artifact? How is it different from what already exists?"

| # | Likely question | Screen that answers | Failure mode |
|---|---|---|---|
| 1 | "What's the one headline finding I could publish in Datalab?" | `/` top diagnosis card (the highest-magnitude claim with full evidence) | No clear headline → "another atlas" verdict |
| 2 | "How do you handle the 2020–2023 NDA-aggregated rows?" | `/methodology` quirk note + per-figure flag | Hidden caveat = research-credibility hit |
| 3 | "What's your difference vs QWIDS / IATI / Datalab?" | Slide in deck + competitive note in methodology | "We made it pretty" is not a defense |
| 4 | "Could I cite a specific number? Where's the version stamp?" | Methodology page footer with build date + git SHA + canonical link | No citation block = unciteable |
| 5 | "Who is the reader?" | First sentence of every page is persona-anchored | Generic landing copy |
| 6 | "Which finding is novel — not already in OECD's annual report?" | Misalignment Index + Tagged-vs-targeted ratio (M9) — these are new framings | Re-reporting OECD's own headlines = no value-add |

**Defensibility risk:** Tomasso evaluates research artifacts. If our methodology page is thinner than a typical academic appendix, we're toast.

---

### J3 — Samir Khan · Policy Analyst, OECD

**Lens:** "Could I use this for my next brief? Would it survive my director's review?"

| # | Likely question | Screen that answers | Failure mode |
|---|---|---|---|
| 1 | "Why 2023-deflated? Where's nominal?" | Methodology + toggle on `/query` for nominal | Single-mode display = pointed-out as inflexible |
| 2 | "How do you treat 'bilateral, unspecified' grants?" | Methodology note + opt-in toggle | Silently included = corruption of country rankings |
| 3 | "Does this reconcile to OECD DAC Table I?" | M8 trust column with explicit canonical reference | "Internal-only" with no published-canon link = fragile |
| 4 | "Why exclude foundations not in OECD reporting?" | Methodology coverage note | Treated as if our 506 foundations = total philanthropy = wrong |
| 5 | "Can I see Korea vs DAC peers without three pulls?" | `/country/kor` peer-comparator (M4) | Single-country profile only, no peers = same as STATA |
| 6 | "Does the SDG misalignment pass a Simpson's check by flow type?" | Simpson's-flag (M13) on each diagnosis | Aggregated trend with hidden subgroup reversal |
| 7 | "What about climate adaptation in LDCs in 2023?" (his real ad-hoc) | `/query` slice with marker + LDC list filter, scaffold output | Filter exists but doesn't produce a brief snippet |

**Defensibility risk:** Samir is the most rigorous and most generous. He'll *want* to like it. He will lose interest only if our numbers don't reconcile or if our methodology has gaps. The trust column and Simpson's-flag exist specifically for him.

---

### Coverage matrix

| Screen | Covers J1 | Covers J2 | Covers J3 |
|---|---|---|---|
| `/` Decision brief | Q1 (Gates lens), Q5, Q6 | Q1, Q5 | — |
| `/diagnose/sdg` | Q2 | Q1, Q6 | Q3, Q6 |
| `/country/[iso]` | Q1, Q3 | — | Q5 |
| `/query` | Q4, Q5 | Q4 | Q1, Q2, Q4, Q7 |
| `/methodology` | Q3 | Q2, Q3, Q4 | Q1, Q2, Q3, Q4 |

**Gap detected:** J1-Q4 ("polio lumped in health") is only covered if `/query` supports subsector filter. **Action: P0.4 must include subsector as a filterable dimension, not just sector.** Updating G5's metric M6 spec accordingly.

**Gap detected:** J3-Q1 ("nominal toggle") is currently unaddressed. **Action: low-cost addition — a single toggle on the methodology page would suffice; defer to P1 unless trivial during build.**

---

## Part B — 5-minute talk track plotted to screens

The talk runs 5 minutes. Every 30-second block earns its place against the judges' lens.

| Time | Beat | Screen / artifact | What I say (verbatim outline) | Risk if cut |
|---|---|---|---|---|
| 0:00 – 0:30 | **Hook + persona** | Title slide → `/` | "OECD analysts spend six hours assembling data for every philanthropy brief. Most of that time is reconciliation, not analysis. Our dashboard turns a six-hour brief into a ninety-minute one — by producing what an analyst actually delivers, not what they consume." Name-check Samir's role. | Without persona anchor, judges think "atlas." |
| 0:30 – 1:30 | **Diagnosis 1: SDG misalignment** | `/diagnose/sdg` — heatmap + click into one cell | Click into Goal 13 (climate). Read the auto-generated scaffold. "Philanthropy spends 4.2 pp less on climate than its share of measured global need. The gap widened in 2023. The principal-objective ratio is 38%, meaning much of the funding is co-benefit, not targeted." Show trust badge. | Without this beat, no decision-intelligence proof. |
| 1:30 – 2:30 | **Diagnosis 2: country profile** | `/country/kor` (a real DAC member upcoming for peer review) | "If Samir is preparing the Korea peer-review chapter, here's the draft chapter. Sector mix vs DAC average. Cross-border vs domestic. Channel preference. He edits the scaffold — he doesn't write from scratch." | Without this, S2 (peer review) story fails. |
| 2:30 – 3:30 | **Diagnosis 3: ad-hoc query** | `/query` — filter to climate adaptation, LDCs, 2023 | "A parliamentary question lands in his inbox. He filters here. Top donors, channel mix, YoY change with confidence flag, caveat block. Copy. Paste. Shipped in fifteen minutes." | Without this, S3 (ad-hoc) story fails. |
| 3:30 – 4:00 | **Defensibility** | `/methodology` — reconciliation matrix + Simpson's flag | "Every figure reconciles to OECD canon within ±2%. Where it doesn't, we say so. We've baked Simpson's-paradox checks into every aggregation — a flag fires when a headline reverses sign by flow type." | Without this, J3 (Samir) is unconvinced. |
| 4:00 – 4:30 | **What we are not** | One slide: competitive matrix | "QWIDS gives you data. IATI tracks aid not philanthropy. Candid is paywalled and US-centric. Datalab publishes after the fact. We sit between the data and the brief." | Without this, J2 (Tomasso) asks "why not just QWIDS?" |
| 4:30 – 5:00 | **Limitations + what's next** | Limitations slide + roadmap slide | "Three caveats: 4-year window means trend claims are conservative. Need-side comparator depends on SDR2024 — we expose the formula. Foundations not in OECD reporting are not in the picture, and we say so. Next: ODA cross-comparison, public canon scraping, and persona-validated prose toggle." | Without honest limits, judges suspect we don't know our weaknesses. |

**Critical structural note:** the three diagnoses (1:30, 2:30, 3:30) are *the same dashboard architecture seen through three lenses*. Same scaffolding, same trust column, same caveat treatment. The repetition is the point — it shows the architecture scales.

**Cut hierarchy if we run long:** drop the competitive slide first (4:00–4:30) since the methodology page implicitly covers it.

---

## Part C — Knowledge synthesis: v1 → v3

### What survives unchanged

| v1 artifact | Why it survives |
|---|---|
| `scripts/preprocess.py` | Foundation. Extended in C2, not replaced. |
| `lib/format.ts`, `lib/data.ts` | Type-safe data plumbing; reusable as-is. |
| `app/globals.css` design tokens | Editorial palette holds; still appropriate for a policy tool. |
| `components/section.tsx`, `components/card.tsx`, `components/stat-card.tsx` | Layout primitives; reusable. |
| `components/bar-list.tsx`, `components/timeseries-chart.tsx`, `components/column-chart.tsx` | Hand-rolled SVG charts; reusable as evidence panels under scaffolds. |
| `components/nav.tsx`, `components/footer.tsx` | Site chrome; nav items will be re-labeled in C9. |
| `app/layout.tsx` (current state) | Fonts + layout shell. Untouched in v3. |
| `data/raw/` and `public/data/` baseline JSONs | Already there; new JSONs *added*, not replaced. |

### What gets replaced (page narratives)

| v1 page | v3 replacement | Reason |
|---|---|---|
| `/` "Where the world's foundations give" hero + judge-questions card grid | `/` decision brief: 3 KPI cards + 3 ranked diagnoses with action titles | Atlas framing → decision-intelligence framing |
| `/explore` (filterable explorer) | `/query` (filterable + scaffold output) | Filters are the same; output format becomes a brief snippet |
| `/donors` (top-50 index) | DEMOTED — table moves to a sub-route or is removed entirely (P2) | Donor portrait does not drive a decision |
| `/donors/[slug]` (foundation portrait) | DEFERRED to P2 — if shipped, reframe as "partner-fit profile" with a benchmark, not a portrait | Same reason |
| `/insights` (markers + SDGs + channels mash-up) | SPLIT: SDG content → `/diagnose/sdg`; markers → `/diagnose/markers` (P1); channels move into country-profile + query | Each subject deserves its own decision question |
| `/methodology` (good but thin) | EXTENDED with: trust matrix, Simpson's-flag explanation, peer-group definition, citation block, version stamp | Now serves J2 + J3 explicitly |

### v1 traps to avoid in v3

1. **"Data allows ≠ should build."** v1 built a per-donor profile for all top 50 because the data made it easy. None drove a decision. v3 cuts donor profiles unless they answer a benchmark question.
2. **"Atlas headline."** v1's hero said "Where the world's foundations give." v3's hero says "Today's diagnoses for foundation alignment with public goals." Different reading lens.
3. **"Pre-baked questions instead of pre-baked answers."** v1's judge-question card showed top-5 lists. v3 shows the *paragraph that would go into a brief*, with the list as the evidence underneath.
4. **"Charts without action titles."** v1 chart titles were topical ("Top 10 sectors"). v3 titles are claim-shaped ("Health absorbs 44% — but principal-objective health is half that").
5. **"Methodology as footer link."** v1 linked it from the footer. v3 makes the trust column visible on every page so methodology is consumed inline, not as an afterthought.
6. **"Single global lens hiding Simpson's effects."** v1 showed global trends; Mexico's domestic flow could swing them. v3 always exposes the flow split when reporting a slice.

### What this synthesis tells us about the build

- **Build order matters.** C5 (scaffold + trust badge) must precede C6/C7/C8 — every subsequent page consumes those primitives.
- **The atlas pages are *not* throwaway code.** Most of the v1 visual work survives as evidence panels. We are reframing, not rewriting.
- **The trap to watch in C9 (homepage rewrite).** When I rebuild `/`, the muscle memory will pull me toward the old hero. Re-read this synthesis and the talk-track row 0:00–0:30 before writing C9.

---

## Part D — Updated sign-off (carries from G5)

| | Decision |
|---|---|
| Persona | OECD policy analyst (P0) — confirmed |
| UX | Scaffold-first; prose toggle = stretch — confirmed |
| Trust column | Required everywhere; internal-only fallback acceptable — confirmed |
| Infrastructure | v1 carries forward as documented in Part C — confirmed |
| Scope | P0 = 8 artifacts; updated: M6 (ad-hoc slice) must include subsector dimension — **change request from G6** |
| New addition (low-cost) | Methodology page nominal-vs-deflated note — accept (15 min cost) |

**Final binding rules across all gates** (re-read before every C-step):
1. Every screen ends in a scaffold or action — never just charts.
2. Every figure reconciles to a canon (or is flagged "internal-only").
3. No "trend" claim from <50 grants per year.
4. Domestic ≠ cross-border; never aggregate without showing the split.
5. Subsector is a first-class dimension, not buried under sector.
6. Every page's first line names the persona it serves.

---

## Carry-forward to C1

**Construction starts when Maxime says "approved, start C1."** No more gates after this one. The 30-min cost of G6 is logged; remaining time budget = ~9 hours of construction + 1 hour deploy/demo prep against ~10–11 hours of available runway.

If I find a real product-thinking gap mid-build, I will halt and surface it explicitly — but I will not invent new gates to delay execution.
