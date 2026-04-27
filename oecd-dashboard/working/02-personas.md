# G2 · Personas + User Scenarios

**Owner:** ux-researcher (lead) + market-researcher
**Brief:** Build a real, decision-grounded persona for the OECD policy analyst, plus three concrete usage scenarios that the dashboard must serve. Validate by asking: *if Samir cannot draft his deliverable in <50% of his current time, the dashboard fails.*

---

## P0 — Samir K., OECD Policy Analyst

| Attribute | Detail |
|---|---|
| **Title** | Policy Analyst |
| **Team** | OECD Centre on Philanthropy / DAC Statistics & Development Finance |
| **Location** | Paris (HQ) |
| **Reports to** | Director, Network of Foundations Working for Development (netFWD) |
| **Tenure** | 4–7 years on the data side; came from a development-economics PhD or government statistics office |
| **Primary deliverables** | (1) Briefs for OECD-DAC peer reviews, (2) chapters in the biennial *Private Philanthropy for Development* report, (3) talking-points memos for senior leadership, (4) ad-hoc parliamentary / member-state response notes |
| **Cadence** | 1–2 briefs/week, 3–5 ad-hoc requests/week, 1–2 internal peer reviews/quarter |
| **Tools today** | OECD.Stat web portal, internal STATA workbooks, Excel pivot tables, PowerBI internal dashboards (read-only), email + Word for actual delivery |
| **Info-diet** | OECD bulletins, Devex morning brief, *Alliance Magazine*, *Stanford Social Innovation Review*, IATI updates, monthly netFWD calls |

### What he actually does in a week

| Day | Activity |
|---|---|
| Mon AM | Triage 3–5 inbound requests from member-state delegations, partner orgs, and senior leadership |
| Mon PM | Begin pull for the highest-priority brief — usually Excel + STATA + manual reconciliation |
| Tue–Wed | Cross-check totals against canonical OECD-published figures; flag deflation method, NDA-aggregated rows, "bilateral unspecified" treatment |
| Thu | Write the actual brief (the part that should take longest) but in practice gets ~30% of the time because data assembly ate the rest |
| Fri | Internal peer review, edits, send up. Repeat for next brief. |

### Pain points (in his words, paraphrased)

1. *"I spend 60% of my time assembling, 30% reconciling, 10% writing. The 10% is the only part that uses my training."*
2. *"Every time I deflate, I have to re-explain to a junior team member why the numbers don't match the press release. The press release was nominal. Mine is 2023-constant. I lose 20 minutes per re-explanation."*
3. *"I cannot easily say 'compared to peer DAC members' without three separate STATA pulls."*
4. *"I know SDG focus is tagged on most grants but I have no quick way to see funding-vs-need misalignment by goal."*
5. *"I trust my numbers but I cannot defend them mid-meeting without a pre-built reconciliation table."*

### Goals (what he wants from a tool)

- **G-A** Drop the brief-prep time from 6 hours to <2 hours.
- **G-B** Surface non-obvious cross-cuts (Simpson's-paradox patterns, year-on-year shifts that don't appear in headline totals) in <5 clicks.
- **G-C** Produce defensible reconciliation: every figure on screen ties to an OECD-published canonical figure within ±2%.
- **G-D** Generate either *prose snippets* he can edit OR *argument scaffolds* (claim/evidence/caveat) — to be validated. Default = scaffold, with an opt-in "draft prose" mode.

### Validated hypothesis on the "draft prose" question

The G1 risk: does Samir want generated prose? Walking it through:
- He will not paste a paragraph from an unknown tool into a brief without rewriting.
- BUT he will gladly accept a **structured scaffold** with the bones already in place: the headline, the supporting evidence, the comparative benchmark, the caveat.
- And he will value a **one-paragraph "if you only had 50 words" digest** for emails to leadership.

**Decision:** Build for scaffolds first. Add an opt-in "draft prose" toggle as a stretch. Don't lead with prose generation.

---

## P1 — Diptesh, Senior Program Officer at Gates Foundation

Same dashboard, different reading lens. He reads the misalignment heatmap as *"where could Gates fill a gap or co-fund?"* He uses the same country profiles, but to assess co-funding partners not benchmarks. He is not a primary user; we just need to ensure the screens DON'T break for his lens. Specifically: every "OECD analyst" framing must have a generic enough title that a foundation user doesn't feel the tool is hostile to him.

## P2 — Tomasso, Director of Research at Giving Tuesday

Reads the dashboard as *"what story should we publish this month?"*. Wants downloadable charts and a citable methodology. Same dashboard, lighter lens. Again — make sure the methodology page is genuinely usable for citation (DOI-style cite block, version stamp).

---

## Three usage scenarios (P0 priorities)

### Scenario 1 — Annual HLPF input (recurring, high stakes)

**Trigger.** The UN High-Level Political Forum on Sustainable Development convenes; OECD must submit a 4-page input on "where private philanthropy is mis-aligned with the SDGs."
**Today's workflow.** ~8 hours over 2 days: STATA pull by SDG, deflate, cross-tab with country development indicators, write, peer review.
**Target workflow.** 90 minutes total: open `/diagnose`, filter by year window, pick the SDG misalignment view, copy the scaffold, edit, submit.
**Definition of success.** Samir can write the same paragraph he'd write today, but the tool gives him: (1) the misalignment ranking, (2) a comparator chart, (3) the caveat language pre-drafted, (4) the citation block.

### Scenario 2 — DAC peer review of a member country (rotating)

**Trigger.** OECD is conducting a peer review of (say) Korea. Samir owns the philanthropy chapter.
**Today's workflow.** ~6 hours: pull Korea's outflows by sector / year / channel, compare to DAC average, write the chapter, hand to the country team.
**Target workflow.** 60 minutes: open `/country/kor`, see auto-generated profile, edit the scaffold, drop in.
**Definition of success.** Profile reads as "Korea vs DAC average vs peer DAC members" with country flagged where it is materially above/below. Includes channel mix, top sectors, top recipients, cross-border share, and a *what changed since last peer review* line.

### Scenario 3 — Parliamentary / ad-hoc response (ad-hoc, time-pressured)

**Trigger.** A member-state parliamentary question lands: *"How much philanthropy went to climate adaptation in Least Developed Countries in 2023, and which donors led?"*
**Today's workflow.** ~3 hours including reconciliation. The kind of request where Samir feels the brunt of the assembly tax.
**Target workflow.** 15 minutes: ad-hoc query interface, sector + flag + country group filter, exports a one-page brief.
**Definition of success.** Single screen: total $, top 5 donors, channel mix, YoY change, caveat block, citation. Copy-pastable.

---

## Journey map (Scenario 1 condensed)

```
START                                                                END
  │                                                                    │
  ├─ Inbox: HLPF brief request (Mon AM)                                │
  ├─ Open dashboard → Today's diagnoses                                │
  ├─ Pick "SDG misalignment" diagnosis card                            │
  ├─ Filter: year window, exclude NDA-aggregated, include only         │
  │  cross-border (HLPF context)                                       │
  ├─ Read auto-generated scaffold for goals 13 (climate), 5 (gender),  │
  │  16 (peace)                                                        │
  ├─ Drill into goal 13: see top funders, gap vs SDR-need ranking,     │
  │  comparator chart                                                  │
  ├─ Click "draft prose" toggle, get 3 candidate paragraphs            │
  ├─ Edit, paste into Word                                             │
  ├─ Click "export reconciliation table" for footnote                  │
  └─ Done                                                              │
                                                                       END
```

Critical path = **5 clicks max** from open to draft-ready. Anything more and we've failed the persona.

---

## Carry-forward to G3

- Decision questions must serve the three scenarios, in priority order: HLPF (S1) → peer review (S2) → ad-hoc query (S3).
- "Scaffold-first, prose-toggle" is the binding UX choice. Frame all metric outputs as *claim / evidence / caveat* triples.
- Reconciliation-to-OECD-canon is non-negotiable. Every figure on screen needs a `±2% to OECD` badge or a "cannot reconcile — see methodology" warning.
