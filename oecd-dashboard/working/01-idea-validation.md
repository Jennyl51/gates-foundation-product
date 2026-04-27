# G1 · Idea Pressure-Test

**Owner:** project-idea-validator + competitive-analyst
**Brief:** Pressure-test the v3 concept ("a public, decision-intelligence dashboard for the OECD philanthropy dataset, anchored on the OECD policy analyst as primary user") against existing tools. Hunt for the fatal flaw before we commit a single line of code.
**Verdict (TL;DR):** **GO with one binding condition.**

---

## What we are validating

> A public web dashboard built on the OECD private-philanthropy database (2020–2023) that does not stop at "here are the patterns." It produces draft policy-implication paragraphs an OECD analyst could paste into a brief, with full evidence drill-down and a numerical-trust column reconciling every figure to OECD's own published totals.

## Competitive teardown

| Tool | Owner | What it does | How it fails the OECD analyst |
|---|---|---|---|
| **OECD QWIDS / OECD.Stat** | OECD itself | Browse-and-download UI on the same source data | Pure data; zero narrative; analyst still has to do all the cross-tabulation, deflation, and write-up by hand |
| **OECD Aid Statistics (DAC)** | OECD DAC | Per-country tables, "key data" PDFs | Annual PDFs only; no interactive slicing; lags 12 months |
| **IATI d-portal** | IATI Secretariat | Aid activity browser | Tracks aid not philanthropy specifically; weak on outcome markers; not curated for philanthropy taxonomy |
| **Candid Foundation Maps** | Candid | Interactive map of US foundation grants | Paywalled; US-centric; donor-portfolio framing not policy |
| **Candid Glasspockets** | Candid | Foundation transparency index | Governance-scoring, not funding-pattern analysis |
| **Giving Tuesday Datalab** | GT | Research reports, periodic | Static PDFs; no interaction; US-tilted |
| **360Giving GrantNav** | 360Giving | UK foundation grant search | UK-only; search-not-synthesis; no policy framing |
| **Open Philanthropy grants DB** | Open Phil | Their own grants only | Single-funder view; not field-level |
| **Devex Funding Insights** | Devex | Funder profiles + opportunity feed | Paywalled; aimed at NGOs hunting for funding, not analysts diagnosing the field |
| **CGD / Brookings briefs** | Think tanks | Periodic policy papers using OECD data | One-shot publications; no interactive layer; takes weeks |
| **DataReportal / Statista** | Aggregators | Headline numbers | Aggregated charts only; no source drilldown |

## The whitespace, in one line

**Nobody turns the OECD philanthropy DB into the analyst's deliverable.** They all stop at the analyst's *input*. The ~6 hours an OECD analyst spends per brief — pulling, deflating, reconciling, comparing to canon, writing a defensible paragraph — is exactly the work nobody else automates.

## Fatal-flaw hunt

| Hypothesis | Evidence | Verdict |
|---|---|---|
| **F1.** "OECD will refuse a third-party tool that wraps their data." | Their data is published openly under CC BY 4.0; their own QWIDS is read-only. A complementary analyst-productivity tool sits beside, doesn't compete. Plus one judge IS an OECD analyst — a tacit invitation. | Not fatal. |
| **F2.** "The data is too thin (3 years, 2020–2023) for trend claims." | Real risk. We address by being explicit about uncertainty (CI bands, p-values), avoiding 'trend' language for 3-year movements, and labelling 2020–2023 NDA-aggregated rows clearly. | Mitigated, not eliminated. **Binding constraint.** |
| **F3.** "Draft policy paragraphs from automated analysis are unsafe — analysts won't trust them." | They're *draft* paragraphs, not autopublished. They come with full evidence trails and a trust column. The analyst edits them. We frame them like Grammarly-for-policy-briefs, not autopilot. | Mitigated by framing. |
| **F4.** "We can't compute a Misalignment Index without external need data (WDI, SDR)." | True. Solvable: SDR2024 country scores and WDI 2023 indicators are CSV-downloadable, well-known, and part of OECD analysts' info-diet already. Joining is mechanical. | Not fatal. **Adds 30 min preprocess work.** |
| **F5.** "Three other case-comp teams will build the same thing." | Almost certainly false. The default move is an atlas (which is what I built in v1). Nobody on a 48-hour case-comp clock pivots to decision-intelligence + draft-paragraph generation. *That is the moat.* | Not fatal. Confirmation that this is the right wedge. |
| **F6.** "Time pressure — we have hours, not days." | Real. Mitigated by the gate phase forcing scope discipline and by salvaging the v1 infrastructure (preprocess + design tokens). | Mitigated. **Binding constraint.** |

## Strengths (objectively credited, not flattered)

- **Demand is verified by the brief itself.** OECD's own analyst is on the judge panel. The judges asked for a tool *for policymakers and foundation leaders*. We are building exactly that.
- **Differentiation is structural, not superficial.** The "draft-paragraph + trust column" is a genuine product unlock that scales beyond a case comp.
- **Defensibility comes from rigor, not features.** Every claim reconciles to OECD canon. That's a moat against teams who built prettier atlases.
- **Persona is grounded.** Samir exists. He's literally one of the three judges. We can demo to him.

## Weaknesses (ruthless)

- **W1.** We have not yet validated externally that draft policy paragraphs are something OECD analysts want vs. resist. Risk: the analyst feels patronized. *Mitigation:* gate G2 will validate by walking through the persona's day; if the answer is "hands off my prose," we pivot from paragraph generation to **structured argument scaffolds** (claim → evidence → caveat), still useful, still differentiated.
- **W2.** "Misalignment Index" is a single composite metric. If anyone digs in and finds the formula brittle, the trust collapses. *Mitigation:* expose the formula, expose the components, never present the composite without the decomposition one click away.
- **W3.** We have one weekend. Building five new pages from scratch is not realistic without ruthless cuts in G5.
- **W4.** OECD analysts may have internal tools we don't know about. *Mitigation:* assume they do, and position our tool as the *public* version of what only DAC members currently see.

## Verdict

**GO.** With one binding condition: **the dashboard MUST produce the analyst's deliverable, not the analyst's input.** If at any point during construction we drift back toward "explorer / atlas" framing, that drift is the fatal flaw materializing. Gate G5 will codify this as a hard rule.

## Carry-forward to G2

- Persona work needs to validate the "draft paragraph" hypothesis specifically — does Samir actually want generated prose, or scaffolds, or just one-click charts? That's the next decision.
- Carry the three constraint pillars: 3-yr-data caution, paragraph-as-draft framing, ruthless scope.
