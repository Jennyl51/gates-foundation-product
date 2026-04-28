# OECD Decision Atlas

A reading of the OECD philanthropy database.

SP26 DSS x Datagood x OP Case Competition 
Product Track - [Ayah Elzein, Maxime Chung, Jenny Liang]

### Basic Git Commands & Set up ###
**Set Up**
- Recommended approach: Create a new folder on your local desktop for case competition
- Clone the remote git repository:
  - Run `git remote https://github.com/Jennyl51/gates-foundation-product`
- Change directory to gates-foundation-product `cd gates-foundation-product`
  - `gates-foundation-product` is just a container folder, and the real frontend and backend is in the directory named `oecd-dashboard`
- Check remote connect `git remote -v`
- Pull all changes `git pull`

**Run Dashboard**
- Change directory: `cd oecd-dashboard`
```bash
npm install
npm run dev
```

- Open site: http://localhost:3000/

**Push Changes**
```bash
git add .
git commite -m"your message"
git push origin main
```

**Change Branch/merge**
- To check all the branches: `git branch`
- To move to a certain branch: `git checkout branch-name`
- To merge branch:
  - move to main branch: `git checkout main`
  - merge branch: `git merge branch-name`




---

## Run it locally (5 minutes)

You need Node 20 or newer and Python 3.

```
# 1. Get the code (if you haven't already)
git clone https://github.com/Jennyl51/gates-foundation-product.git
cd gates-foundation-product/oecd-dashboard

# 2. Drop the OECD CSV into data/raw/
# Filename must be: oecd-funding.csv
# (The CSV is gitignored because it's 60 MB. Get it from Maxime or the case-comp upload.)

# 3. Build the JSON files the dashboard reads
python3 scripts/preprocess.py

# 4. Install and run
npm install
npm run dev
```

Open http://localhost:3000 in your browser. Five pages to look at:

| Path | What it shows |
|---|---|
| `/` | Decision brief homepage with three ranked findings |
| `/diagnose/sdg` | The signature page. Two lenses on UN-goal misalignment |
| `/country` | Index of 26 OECD donor-country profiles |
| `/country/united-states` (or any slug) | Per-country profile with peer-comparator scaffold |
| `/explore` | Filter UI. Produces an auto-generated brief snippet on every change |
| `/methodology` | Trust-tier explanation, caveats, glossary |

---

## How to give feedback

Open an issue in this repo. Most useful feedback:

1. Anything that reads as marketing copy rather than analysis (we are aiming for restrained, observational language).
2. Numbers that feel wrong. Click the trust badge tooltip first to see the tier.
3. Layout or contrast issues. Tell us the URL and the section.
4. Pages or visuals that don't end in a clear claim or action.

---

## Where to read before changing anything

| File | Purpose |
|---|---|
| `working/SESSION-RESUME.md` | Two-minute orientation for anyone resuming work |
| `working/06-demo-acceptance.md` | The 5-minute demo talk track and judge game-theory |
| `HANDOFF.md` | Developer overview of the file structure and what's left |
| `working/00-gate-revisions.md` | Latest scope adjustments |

The full decision trail is in `working/01..06.md`.

---

## Quick tech reference

- Next.js 16, React 19, Tailwind 4, TypeScript.
- Static export. No server runtime. Deploys cleanly to Vercel.
- Interactive charts use Plotly (basic build). Static lists are hand-rolled SVG. See `components/`.
- Data preparation is `scripts/preprocess.py`. CSV in, JSON out. Run once locally before `npm run dev`.
- Trust badge component (`components/trust-badge.tsx`) wraps every number rendered.
- Scaffold component (`components/scaffold.tsx`) is the claim/evidence/caveat block.
- Glossary tooltips for jargon: hover any dotted-underlined term (OECD, DAC, LDC, HHI, SDG, etc.).

---

## What is interactive today

| Page | Interaction |
|---|---|
| `/` Decision brief | KPI selector swaps the headline figure between four lenses (disbursement, foundations, recipients, cross-border) and reveals matching insights. |
| `/diagnose/sdg` Goal Alignment | Sortable chart and table that re-order together by SDG number, dollar share, need share, or delta. Plotly hover shows full breakdown per goal. Plus a TL;DR briefing block at the top with a one-click copy as markdown for paste-into-brief. |
| `/country/[slug]` Country profile | Plotly time series with year-by-year hover values. Diverging deltas vs OECD-DAC average. |
| `/donors/[slug]` Foundation portrait | Plotly time series with hover. Sample-grant cards. |
| `/explore` Slice the data | Multi-select filters that re-aggregate live and produce a draft brief snippet with a copy button. |
| Across pages | Active-route highlighting in the nav. Glossary tooltips on jargon. Trust-tier badges (A canon, B internal, C small-sample) on every figure. |

---

## Future improvements (not included in this submission)

These were considered and deliberately deferred for the submission deadline. Each would meaningfully strengthen the dashboard.

### Future improvements

1. **Country-by-goal SDG misalignment lens.** The current Goal Alignment page uses world-average need scores. The Sustainable Development Report 2024 publishes country-by-goal scores that, joined to the recipient column in the OECD CSV, would let an analyst see which specific countries are most under-funded on each goal. Build environment couldn't reach the SDR website, so this was punted to a manual download step. Effort: 30 minutes once the CSV is in hand.
2. **Reconciliation against OECD canonical published totals.** Today every figure on the dashboard ships at trust-tier B (recomputed correctly from the source spreadsheet, not yet matched to OECD's own published table). A manually built `data/canonicals.json` mapping our pivots to OECD DAC Table I / II / III figures would let figures lift to tier A. Effort: 45 to 60 minutes.
3. **Cross-page filter persistence via URL search params.** Pick year=2023 and region=Africa once, see those filters apply on every page. Today filters reset between pages. Effort: 60 to 90 minutes.
4. **Country-vs-country comparison view.** Pick two donor countries and see their sector mix, region mix, channel mix side by side as deltas. Most natural for a DAC peer-review workflow. Effort: 90 minutes.
5. **Choropleth world map of recipient flows.** The data is there (`top-recipient-countries.json`). Visual punch for the demo, not strictly decision-critical. Effort: 60 minutes (Plotly choropleth supports country-name lookup natively).

### Medium-leverage improvements

6. **Drill-down click filters.** Click a goal in the misalignment chart, the page reloads with country-tier numbers filtered to that goal. Today this requires re-running the explore page.
7. **Marker-and-SDG cross-tab on the Insights page.** Tagged-but-not-targeted gaps (e.g., grants with SDG 13 but no climate marker) are computable from the existing data; a small page would surface them.
8. **Concentration-warning page.** `concentration.json` already lists 300 single-funder slices. A dedicated page with sortable HHI bands would surface single-funder dependency risks.
9. **Sortable country-profile table on /country.** Currently grouped by stable / directional only.
10. **Export the explorer's brief snippet as a Word document** rather than plain text. Would land directly into the analyst's working doc.

### Low-leverage but visually appealing

11. Animated number transitions on KPI swap. Counts climbing rather than snapping.
12. Mobile audit and breakpoints. Today the dashboard is desktop-first.
13. Dark mode toggle.

---

## Status

Build is clean: TypeScript and ESLint at zero. 86 static pages generate (1 home + 1 goal alignment + 26 country profiles + 50 donor portraits + 1 explore + 1 methodology + system pages).

If you cloned fresh and `npm run dev` errors on a missing JSON, run `python3 scripts/preprocess.py` once. The script reads `data/raw/oecd-funding.csv` (gitignored, drop the case-comp file there) and produces all the JSONs the dashboard reads.

