# G3 · Decision Questions + Data Feasibility

> **REVISED — read [00-gate-revisions.md](./00-gate-revisions.md) first.**
> One new decision question added (DQ1.1b — country-tier misalignment via Least Developed Countries proxy), and DQ1.1's "world-average only" limitation is acknowledged in the revision document.


**Owner:** question-framing skill + data-researcher
**Brief:** Translate each of the three usage scenarios into 3–5 decision questions. For each, check feasibility against the OECD CSV (32 columns) plus identifiable external joins. Reject any question that can't be answered with current or near-current data.

---

## Notation

- **NATIVE** — answerable with the OECD CSV alone
- **JOIN(x)** — needs an external dataset (named) joined in
- **EXTEND** — answerable but requires a new aggregation step in `preprocess.py`
- **NO** — not answerable; reject and find a substitute

Priority: **P0** (must) / **P1** (should) / **P2** (nice).

---

## Scenario 1 — Annual HLPF input (P0)

Frame: *Where is private philanthropy mis-aligned with the SDGs, and is the gap closing?*

| ID | Question | Feasibility | Decision it informs |
|---|---|---|---|
| **DQ1.1** (P0) | Which SDGs receive disproportionately *low* private philanthropy funding relative to global need? | NATIVE (sdg_focus, usd_disbursements_defl) + **JOIN(SDR2024 country-goal scores)** for the "need" comparator | Which SDGs to highlight as under-funded in HLPF input |
| **DQ1.2** (P0) | How has philanthropic funding per SDG goal moved over 2020 → 2023? | NATIVE | Trend para in HLPF input |
| **DQ1.3** (P1) | For each SDG, which goal is *tagged* on grants but *not principally targeted* by the relevant policy marker (gender / climate / env / nutrition)? | NATIVE + EXTEND (cross-tab sdg_focus × marker_score) | Reveals "rhetorical alignment" gaps for HLPF |
| **DQ1.4** (P1) | Which donors disproportionately concentrate on a single SDG vs. portfolio-spread? | NATIVE + EXTEND (per-donor SDG entropy) | Identifies thematic vs. generalist funders for the HLPF text |
| **DQ1.5** (P2) | Which recipient regions show the largest mismatch between SDG-tagged $ and SDG-need? | NATIVE + JOIN(SDR2024) + EXTEND | Sub-paragraph "where the gap is largest" |

---

## Scenario 2 — DAC peer review of a member country (P0)

Frame: *For donor country X, profile their private-philanthropy outflow and compare to DAC peers.*

| ID | Question | Feasibility | Decision it informs |
|---|---|---|---|
| **DQ2.1** (P0) | What is the size, sector mix, and recipient-geography mix of country X's private philanthropy outflow? | NATIVE | Profile chapter body |
| **DQ2.2** (P0) | How does country X compare to (a) the DAC member average and (b) up to 5 peer DAC members on the same dimensions? | NATIVE + EXTEND (peer-comparator pivot) | Comparative paragraphs in the peer review |
| **DQ2.3** (P0) | What is country X's cross-border vs domestic split, and how does that compare to peers? | NATIVE | Cross-border/domestic discussion |
| **DQ2.4** (P1) | Which channels of delivery does country X prefer (multilateral / NGO / public / PPP)? | NATIVE | Delivery-mechanism paragraph |
| **DQ2.5** (P2) | Has country X's profile shifted materially over 2020 → 2023? | NATIVE + EXTEND (per-country trend) | "What changed since last peer review" |

---

## Scenario 3 — Ad-hoc parliamentary / member-state query (P0)

Frame: *Given (sector, geo-group, year-window, optional marker), produce a one-page brief.*

| ID | Question | Feasibility | Decision it informs |
|---|---|---|---|
| **DQ3.1** (P0) | For (sector × geo × year), what is total disbursement, top 5 donors, top 5 recipients, channel mix? | NATIVE | Body of the response brief |
| **DQ3.2** (P0) | For the same slice, what is the YoY change and is it statistically meaningful given the small N? | NATIVE + EXTEND (trend slope + CI) | Honest uncertainty in the response |
| **DQ3.3** (P0) | What is the trust column — does this slice reconcile to the OECD canonical published total? | NATIVE + JOIN(OECD published aggregates) — **may need to scrape OECD totals** | Defensibility footnote |
| **DQ3.4** (P1) | If a marker is selected (climate adaptation, gender, etc.), what is the principal-objective vs. significant-objective split in dollars? | NATIVE | Outcome-framing in response |
| **DQ3.5** (P1) | Which countries in the geo-group are conspicuously absent from the funding picture? | NATIVE + JOIN(country list of geo-group, e.g. UN LDC list) | Highlights gaps inside an aggregate |

---

## Cross-cutting questions (used across scenarios)

| ID | Question | Feasibility | Used by |
|---|---|---|---|
| **DQ-X1** | What is the field-level concentration (Herfindahl) per sector × country? | NATIVE + EXTEND | S1, S2, S3 |
| **DQ-X2** | For any cell of the data, what is the principal-objective $ share for each marker? | NATIVE + EXTEND | S1, S3 |
| **DQ-X3** | Does the slice survive Simpson's-paradox check when broken by `type_of_flow`? | NATIVE + EXTEND (auto-Simpson check) | All scenarios — guards against misleading aggregates |

---

## External joins required

| Dataset | Used for | Effort | License | Status |
|---|---|---|---|---|
| **SDR2024 country-by-goal scores** (Sustainable Development Report) | DQ1.1 / DQ1.5 — need-side comparator | ~30 min download + clean | CC BY 4.0 | available, sdgindex.org |
| **WDI 2023 indicators** (population, GNI per capita, LDC list) | DQ1.5, DQ3.5 — denominators and country grouping | ~30 min | World Bank Open Data | available, world bank API |
| **UN LDC / SIDS / LLDC lists** | DQ3.5 — geo group memberships | <10 min | public | UN OHRLLS |
| **OECD canonical totals** (DAC tables I, II, III) | DQ3.3 — reconciliation column | ~45 min — possibly manual scrape | OECD CC | needs investigation; may use the dataset's own self-reconciliation if external is too costly |

**Risk:** the OECD canonical reconciliation (DQ3.3) is the longest-pole task. **Mitigation:** if external scraping is too brittle in the time window, the trust column becomes "internal reconciliation" — every figure is shown alongside the underlying grant-count and the deflation-method note. We label that explicitly: *"reconciles internally; not yet reconciled to OECD published total."*

---

## Questions explicitly REJECTED

| Question | Reason rejected |
|---|---|
| "Which countries spend most on philanthropy as % of GDP?" | Confusing — donor-country GDP would be the comparator, but our dataset doesn't capture all domestic philanthropy in a country (only OECD-reporting foundations). Misleading. |
| "Which foundation has the best impact per dollar?" | NO. Our dataset has no impact / outcome data, only inputs. Misleading and dangerous to suggest. |
| "Predict next year's funding by sector." | Out of scope (descriptive, not predictive) — and we have only 4 years; forecasting is not defensible. |
| "Show the geographic flow on a globe map." | Pretty, not decision-relevant; defer to P2 if at all. |
| "Compare to public ODA aid totals." | Worthwhile but a different dataset; out of scope for this comp. Note as future work. |

---

## Carry-forward to G4

- Each P0/P1 question gets exactly one primary metric + one guardrail in G4.
- The three "EXTEND" items (peer comparator, Herfindahl, Simpson's-flag) drive the next preprocess.py revision.
- DQ3.3 (trust column) is the riskiest — flag in G5 as a candidate for time-box; fallback to internal reconciliation is acceptable.
