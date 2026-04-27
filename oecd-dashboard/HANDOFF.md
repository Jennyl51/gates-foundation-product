# OECD Philanthropy Atlas — Handoff Notes

Hi Ayah & Jenny — here's what I've added to the repo, why it's structured this way, and what's left to do. The goal is for you to be able to pick up any piece independently.

---

## What this is

A Next.js 16 / React 19 dashboard that explores the OECD philanthropy dataset. It's set up as a **read-only static site** powered by precomputed JSON files — no database, no API, no server runtime. That means it deploys to Vercel as a static export and stays free.

---

## How to run it locally

```bash
cd oecd-dashboard
npm install
npm run dev
# open http://localhost:3000
```

If you change the source CSV or add new aggregations:

```bash
python3 scripts/preprocess.py
# regenerates everything in public/data/
```

The raw 60MB CSV lives at `data/raw/oecd-funding.csv`. It is **gitignored** — anyone cloning the repo needs to drop the file into that folder before running preprocess.

---

## File structure

```
oecd-dashboard/
├── app/
│   ├── page.tsx                  # Overview (signature page)
│   ├── layout.tsx                # Root layout — fonts, nav, footer
│   ├── globals.css               # Design tokens (colors, fonts)
│   ├── explore/
│   │   ├── page.tsx              # Server entry
│   │   └── explorer-client.tsx   # Client-side filters + charts
│   ├── donors/
│   │   ├── page.tsx              # Top-50 index table
│   │   └── [slug]/page.tsx       # Per-foundation profile
│   ├── insights/page.tsx         # Markers + SDG view
│   └── methodology/page.tsx      # Caveats + variable glossary
├── components/
│   ├── nav.tsx, footer.tsx       # Site chrome
│   ├── section.tsx               # Editorial section wrapper
│   ├── card.tsx                  # Card / Pill primitives
│   ├── stat-card.tsx             # Hero stat tile
│   ├── bar-list.tsx              # Ranked horizontal bars (workhorse)
│   ├── timeseries-chart.tsx      # Hand-rolled SVG line chart
│   └── column-chart.tsx          # Hand-rolled SVG column chart
├── lib/
│   ├── data.ts                   # Server-side JSON loaders, types
│   └── format.ts                 # USD / number formatters
├── scripts/
│   └── preprocess.py             # Builds public/data/ from raw CSV
├── data/
│   └── raw/                      # gitignored CSV lives here
└── public/
    └── data/                     # Compact JSONs the app reads
```

---

## Design system

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#0F4C5C` | Deep teal — primary brand, CTAs |
| `--accent` | `#C77B3D` | Warm ochre — eyebrows, accent bars |
| `--forest` | `#4A7C59` | Sector / positive bars |
| `--alert` | `#B7472A` | Warnings, removal chips |
| `--paper` | `#F8F5EE` | Page background (warm off-white) |
| `--surface` | `#FFFFFF` | Cards |
| `--border` | `#E8E1D1` | Warm divider |
| `--ink` | `#1A1A1A` | Body text |

Type pairing:
- **Display / serif** (`--font-source-serif`) — Source Serif 4 for editorial titles and big stat numbers
- **Body / sans** (`--font-geist-sans`) — Geist for UI
- **Mono** (`--font-geist-mono`) — Geist Mono for numbers, labels, eyebrows

Don't introduce a new color or a new font without a reason — it'll fight the editorial feel.

---

## Data pipeline (preprocess.py)

The CSV → 14 JSON files. Reading the script top-to-bottom is the fastest way to understand the data model. Highlights:

| File | What it is |
|---|---|
| `summary.json` | Headline numbers used in the hero |
| `top-donors.json` | Top 50 foundations by disbursement |
| `top-recipient-countries.json` | All recipient countries, ranked |
| `top-donor-countries.json` | All donor home countries, ranked |
| `sectors.json` / `subsectors.json` | OECD CRS sector totals |
| `timeseries-year.json` | Year x sector x region pivots for trend charts |
| `markers.json` | Gender / climate / env / nutrition 0/1/2 score rollups |
| `sdg.json` | UN SDG goal totals, multi-tag aware |
| `flow-types.json` | Cross-border vs domestic |
| `channels.json` | OECD channel of delivery |
| `donor-x-country.json` | Top 30 donors x top 30 recipients matrix |
| `judge-questions.json` | Pre-baked answers to the kickoff deck's sample questions |
| `donors/{slug}.json` | Per-foundation profile (×50) |
| `explorer-aggregates.json` | (year, donor_country, region, sector) → ($ + grant count) for the Explorer |
| `legend.json` | OECD variable definitions for the methodology page |

---

## Page-by-page status

| Page | Status | Notes |
|---|---|---|
| `/` Overview | ✅ Done | Hero, judge questions, top-donors, top-recipients, time series, sectors, donor countries, CTA |
| `/explore` | ✅ Done | Multi-select filters on year, donor country, region, sector. Live aggregation. |
| `/donors` | ✅ Done | Sortable-ish table of top 50 with link to each profile |
| `/donors/[slug]` | ✅ Done | Sector mix, country mix, year trend, sample grants. Built for top 50; others 404. |
| `/insights` | ✅ Done | 6 policy markers + 17 SDGs + delivery channels |
| `/methodology` | ✅ Done | Caveats + full variable glossary |

---

## What's missing / opportunities

These would all be additive — the site works without them, but they'd be force-multipliers. Pick what excites you:

1. **A geographic map view.** A choropleth on the explorer or overview showing recipient totals on a world map. We've got country-level data; would need a topojson world map and a simple D3 or hand-rolled SVG renderer. Best place: a new tab on the Overview, or a `/map` page. **High visual impact for the judges.**
2. **Sector sub-page.** `/sectors/[slug]` — same pattern as donor profile but for a sector (e.g. "Health"). Show top donors, top recipient countries, timeline. Easy win because the data is already there.
3. **Sankey: donor → sector or donor → country.** A two-column flow diagram on the Insights page. Moderate effort but visually striking.
4. **A "compare two foundations" view.** Pick two donors, see their sector/geo/year fingerprints side by side. Great for the demo — judges could try "compare Gates vs Ford" live.
5. **Search.** Type-ahead on donors and recipient countries from the nav. Doesn't need a backend — the lists are small enough to filter client-side.
6. **Story mode / guided tour.** A "scrollytelling" intro on the Overview that walks through 5 findings, locking the user in for 60 seconds before dropping them into free exploration.
7. **Polish: micro-animations on filter change.** Bars springing to new values rather than snapping.
8. **Polish: numbers that climb on first paint.** A small "count-up" effect on the hero stats.
9. **Mobile audit.** I designed for desktop first. The grids and chart aspect ratios need a pass at <640px.
10. **Accessibility audit.** Color contrast on the bar-list track is a known weakness; add aria-labels to interactive bars; check keyboard nav on the multi-select filters.

---

## Likely judge questions and where they're answered

| Question | Where in the dashboard |
|---|---|
| "Top donors based out of the UK?" | Overview · Q card #1 ("Wellcome Trust"). Also Explore: filter Donor country = UK. |
| "Top countries for maternal health?" | Overview · Q card #2. |
| "Climate funding over time?" | Overview · Q card #4 (timeseries from climate-marker rows). |
| "Top donor for infectious diseases in India?" | Overview · Q card #5. |
| "What does Gates Foundation actually fund?" | `/donors/gates-foundation` — full profile with sample grants. |
| "How is this different from raw OECD downloads?" | `/methodology` — 8 explanatory notes + glossary. |
| "Where are the gender-equality dollars going?" | `/insights` — Gender marker card with principal-objective top sectors and donors. |

---

## Deployment

```bash
# from the oecd-dashboard/ directory
npm run build
```

For Vercel:
1. Connect the GitHub repo
2. Set the project root to `oecd-dashboard/`
3. Build command: default (`next build`)
4. No env vars needed
5. Deploy

The raw CSV is gitignored, but `public/data/` is committed (the JSONs are small). If preprocess.py is run before a push, the deploy stays in sync.

---

## A few opinionated calls I made (so you can override)

- **Hand-rolled SVG charts** instead of Recharts/Chart.js. Smaller bundle, more editorial look, every visual decision is in our codebase. Trade-off: no built-in tooltips. If we want hover tooltips on the bar charts, easiest route is to wrap a `<title>` SVG element inside each bar (gives basic native tooltips for free).
- **No state library.** Filters live in `useState` inside `explorer-client.tsx`. If we add cross-page state (e.g. "filter persistence across nav"), the cleanest path is URL search params — let me know and I'll wire it up.
- **Pre-aggregation, not raw CSV in the browser.** 116k rows × 32 columns is too heavy for client-side. The `explorer-aggregates.json` is 245KB, which is the right ceiling for snappy filtering.
- **Source Serif 4 + Geist** is the type pairing. It's editorial, slightly journalistic, signals "data + craft." Don't switch to Inter or Arial — they'll make it feel generic.
- **Methodology is a first-class page, not a footer link.** OECD will check this. Keeping it prominent is part of the differentiation.

---

## Quick reference — common edits

**Add a chart to the Overview.** Drop a new `<Card>` inside any `<Section>` in `app/page.tsx`. Use `BarList` for "top X" lists, `TimeSeriesChart` for trend lines, `ColumnChart` for sector-style bars. Server-load the data via `loadXxx()` from `lib/data.ts`.

**Add a filter to the Explorer.** Filters are dimensions on the explorer-aggregates rows. To add (e.g.) a recipient-country filter, you'd need to extend `preprocess.py` to include a country dimension in `explorer-aggregates.json` (the rows would get bigger), then add another `<FilterGroup>` to `explorer-client.tsx`.

**Add a new page.** Create `app/{name}/page.tsx`. Server component by default — use `loadXxx()` from `lib/data.ts`. Add it to `NAV_ITEMS` in `components/nav.tsx`.

**Re-skin colors.** Edit the `:root` CSS variables in `app/globals.css`. Tailwind class shortcuts (`bg-paper`, `text-ink` etc.) are wired through `@theme inline` in the same file.

---

## Questions / feedback

Push back on any of this. The pieces are intentionally small and replaceable — none of it is precious.

— Maxime
