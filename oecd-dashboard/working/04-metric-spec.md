# G4 · Metric Specifications

> **REVISED — read [00-gate-revisions.md](./00-gate-revisions.md) first.**
> M1b added (country-tier misalignment, Least Developed Countries proxy), M6 clarified to include subsector dimension, M8 redesigned as 3-tier trust system (Tier A canonical-match / Tier B internal-only / Tier C small-sample).


**Owners:** data-analyst + trend-analyst + product-management:metrics-review
**Brief:** For each P0/P1 question from G3, define exactly **one primary metric + one guardrail**. Specify formula, unit, sensitivity, and the rejection criteria that suppress or flag the metric. Reject vanity metrics (anything that doesn't change the user's recommendation).

---

## Metric design rules (apply to all rows below)

1. **One primary, one guardrail.** Primary = the number on screen. Guardrail = the validity check; if the guardrail trips, the primary is suppressed or flagged.
2. **Every metric reconciles** to a sum / count from the source CSV (or to a documented external join).
3. **Every metric has rejection criteria.** Below the criteria the metric is *suppressed* (not shown) or *flagged* (shown with a "low confidence" badge).
4. **Every metric has a "what would change this" line** — the analyst must know what evidence would flip the conclusion.
5. **Reject if it doesn't drive a decision.** If two formulas produce the same recommendation, pick the simpler one.

---

## P0 metrics

### M1 — SDG Misalignment Index *(serves DQ1.1)*

| Field | Spec |
|---|---|
| Definition | Per SDG goal G: how much of total philanthropic disbursement targets G, relative to how much that goal needs based on SDR distance-to-target |
| Formula | `MI(G) = phil_share(G) − need_share(G)` where `phil_share(G) = sum(usd_disbursements_defl where sdg_focus contains G) / sum(usd_disbursements_defl across all G)` and `need_share(G) = (1 − global_avg_SDR_score(G)) / sum_over_all_G(1 − global_avg_SDR_score(G))` |
| Unit | percentage points (negative = underfunded vs need) |
| Range | typically −0.10 to +0.10 |
| Guardrail | n_grants_with_goal(G) ≥ 50 |
| Sensitivity | medium-high — sensitive to SDR weighting choice; expose the SDR table and let analyst toggle |
| Rejection | if guardrail < 50 grants, mark "insufficient sample" and suppress the index value |
| What would change this | A different need proxy (e.g. UN target progress vs SDR), a year-window shift |
| Decision served | Which SDGs to call out as under/over-funded in HLPF input |

### M2 — SDG Trend Slope *(serves DQ1.2)*

| Field | Spec |
|---|---|
| Definition | YoY slope of disbursement to a given SDG goal across 2020–2023 |
| Formula | OLS slope `β` on `log(usd + 1)` ~ `year` for the 4-point series; report β with 90% CI |
| Unit | log-points per year (≈ percent per year for small β) |
| Guardrail | p-value < 0.20 OR clear monotonic direction across all 4 years |
| Sensitivity | high — 4 points is a tiny sample. Always show CI band, never a bare slope. |
| Rejection | If guardrail fails, label "no clear signal" and show flat indicator |
| What would change this | Adding 2024+ data; widening to 2018+ if back-filled |
| Decision served | "Is this gap closing?" paragraph in HLPF input |

### M3 — Country Funding Profile *(serves DQ2.1)*

| Field | Spec |
|---|---|
| Definition | For donor country X: total $, sector mix, recipient-region mix, foundation count |
| Formula | Pivots on `Donor_country = X` over `usd_disbursements_defl`, broken by sector_description / region_macro / organization_name |
| Unit | USD mn (deflated 2023) and % share |
| Guardrail | n_foundations(X) ≥ 2 (avoid single-foundation skew) |
| Rejection | If guardrail fails, label "single-foundation country" |
| Decision served | DAC peer-review profile chapter |

### M4 — Peer-Comparator Delta *(serves DQ2.2)*

| Field | Spec |
|---|---|
| Definition | For country X and dimension D (sector / region / channel): X's share minus DAC-average share, plus min/max in the peer group |
| Formula | `delta(X, D) = share_X(D) − mean_over_peers(share_p(D))` for peer group = top-10 DAC donor countries by total $ |
| Unit | percentage points |
| Guardrail | peer group size ≥ 5 |
| Sensitivity | medium — peer group choice matters; expose it |
| Rejection | If <5 peers, expand peer group to all DAC members and label |
| Decision served | "Country X spends X pp more on Y than peers" comparator paragraphs |

### M5 — Cross-border Share *(serves DQ2.3)*

| Field | Spec |
|---|---|
| Definition | Share of disbursement that is cross-border vs. domestic, for a given donor country |
| Formula | `cb_share(X) = sum($ where flow=Cross-border, donor_country=X) / sum($ where donor_country=X)` |
| Unit | percent |
| Guardrail | flow_unspecified $ ≤ 10% of total |
| Rejection | If unspecified > 10%, label and suppress; show only as range |
| Decision served | Cross-border-orientation discussion in peer review |

### M6 — Ad-hoc Slice Total *(serves DQ3.1)*

| Field | Spec |
|---|---|
| Definition | For (sector ∩ geo ∩ year ∩ optional marker): sum disbursement, n grants, top-5 donors, top-5 recipients, channel mix |
| Formula | Standard pivot |
| Unit | USD mn + counts + % share |
| Guardrail | n_grants ≥ 30 for any reported breakdown |
| Sensitivity | low |
| Rejection | If <30 grants, show with "small-N" badge |
| Decision served | Body of an ad-hoc response brief |

### M7 — Ad-hoc YoY Change with Significance *(serves DQ3.2)*

| Field | Spec |
|---|---|
| Definition | Year-over-year disbursement change for the slice, with confidence flag |
| Formula | `delta_yoy = (latest − previous) / previous`; `signal = "yes"` if abs(delta_yoy) > 25% AND n_grants > 50 |
| Unit | percent |
| Guardrail | n_grants ≥ 50 in latest year |
| Rejection | If guardrail fails: "directional only — N too small for a claim" |
| Decision served | "What changed?" paragraph in ad-hoc response |

### M8 — Trust / Reconciliation Column *(serves DQ3.3)*

| Field | Spec |
|---|---|
| Definition | For any displayed total T: `delta_to_canon = (T − T_canonical) / T_canonical` if a canonical equivalent exists |
| Formula | Match dashboard aggregation to the closest OECD-published equivalent (manual matrix in `data/canonicals.json`) |
| Unit | percent |
| Guardrail | tolerance ±2% |
| Rejection | If no canonical match exists: badge reads "internal reconciliation only" |
| Sensitivity | high — this is the credibility column |
| Decision served | Defensibility footnote on every brief |
| Fallback if external scraping fails | Internal reconciliation only: dashboard ↔ raw CSV self-reconciliation, plus a transparent note |

---

## P1 metrics

### M9 — Tagged-but-not-targeted Ratio *(DQ1.3)*

| Field | Spec |
|---|---|
| Formula | For marker M: `ratio(M) = $(marker_M = 1) / $(marker_M ∈ {1,2})` |
| Unit | percent |
| Guardrail | screened_grants(M) ≥ 50 |
| Rejection | <50 screened: suppress |
| Interpretation | High ratio → much "co-benefit" rhetoric, less principal targeting |

### M10 — Donor SDG Concentration *(DQ1.4)*

| Field | Spec |
|---|---|
| Formula | Per donor: SDG entropy `H = −Σ p_i × log(p_i)` over goals i=1..17, `p_i = share of $ tagged with goal i` |
| Unit | nats (0 = single-SDG donor; ~2.83 = uniform) |
| Guardrail | total_grants(donor) ≥ 50 |
| Rejection | <50 grants: suppress |
| Interpretation | Low H = thematic funder; high H = generalist |

### M11 — Channel Mix *(DQ2.4)*

| Field | Spec |
|---|---|
| Formula | `share(channel C) = sum($ via C) / total $`, top-5 channels + "other" |
| Guardrail | n_grants ≥ 100 in the slice |
| Rejection | <100 grants: collapse to "Channel mix not reportable for this slice" |

### M12 — Concentration HHI *(DQ-X1)*

| Field | Spec |
|---|---|
| Formula | `HHI = Σ (share_donor)²` × 10,000 over all donors in the slice |
| Unit | 0–10,000 |
| Thresholds | <1,500 unconcentrated; 1,500–2,500 moderate; >2,500 high |
| Guardrail | n_donors ≥ 3 |
| Rejection | <3 donors: label "single/dual-funder slice — name them" |
| Interpretation | High HHI → field is dominated; entry by another funder is high-leverage |

### M13 — Simpson's-Paradox Flag *(DQ-X3)*

| Field | Spec |
|---|---|
| Definition | Flag any aggregated trend that *reverses* when broken by `type_of_flow` |
| Formula | If sign of M2 (trend slope) on full slice ≠ sign on cross-border-only AND ≠ sign on domestic-only, flag |
| Output | Boolean + which dimension causes the flip |
| Guardrail | n_grants ≥ 100 in each subgroup |
| Action when triggered | Block the headline claim; force showing both subgroups |

---

## What we are explicitly NOT measuring

| Metric | Why rejected |
|---|---|
| Foundation "rank" or "score" | Misleading; impact is not measured here |
| Predictive forecast | Out of scope; small N |
| % of GDP for donor countries | Confusing denominator |
| Per-capita-recipient $ as headline | Useful as a *secondary* lens but distortion-prone (small countries dominate); never lead with it |
| ROI / efficiency | No outcome data — refuse explicitly when asked |

---

## Reconciliation matrix (placeholder for M8)

We will produce a hand-built JSON `data/canonicals.json` mapping dashboard pivots to the closest OECD-published canonical:

```
{
  "total_disbursement_2020_2023": { dashboard: "summary.total_disbursement_usd_mn", canonical_source: "OECD DAC Table I", canonical_value: TBD, tolerance: 0.02 },
  "by_sector_health_2020_2023":   { dashboard: "sectors[Health].disbursement",        canonical_source: "OECD DCD/DAC(2024)X",   canonical_value: TBD, tolerance: 0.05 },
  ...
}
```

If a canonical is not findable in the time-box, the cell stays as "internal-only reconciled" and that's flagged on screen.

---

## Carry-forward to G5

- 8 P0 metrics + 5 P1 metrics. P2 metrics are deferred entirely.
- Three preprocess.py extensions needed: peer-comparator pivot (M4), HHI per slice (M12), Simpson's flag (M13).
- One external join: SDR2024 country-by-goal scores (M1).
- One stretch external: OECD canonical totals (M8) — fall back to internal reconciliation if it's too costly.
- Every metric carries a guardrail; UI must support a "low-confidence" badge state.
