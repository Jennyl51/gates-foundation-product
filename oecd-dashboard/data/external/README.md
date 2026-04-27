# Outside reference data

These four files are small public-domain reference tables we join to the OECD philanthropy spreadsheet so we can answer questions the OECD spreadsheet alone cannot. None of them is heavyweight, none is paywalled, and each one is documented at the top of its own file.

| File | What it is | Why we need it |
|---|---|---|
| `sdg-need-scores.json` | A 17-row table giving the world's progress toward each UN Sustainable Development Goal on a 0–100 scale (100 = goal achieved). | Lets us compare *what philanthropy is funding* with *where the world is least making progress*. Without this, "misalignment" cannot be claimed; we'd just be showing rankings. |
| `least-developed-countries.json` | The United Nations list of the 46 Least Developed Countries. | Lets the analyst quickly answer parliamentary questions like "how much philanthropy went to climate adaptation in the poorest countries last year?" without redefining "the poorest" each time. |
| `country-populations.json` | Population (in millions, mid-2023) for every country that appears in the philanthropy data. | Powers per-person comparisons and labels small-country distortions on the misalignment chart. |
| `dac-members.json` | The 32 member countries of the OECD Development Assistance Committee. | When the dashboard shows "country X versus its peers," the peer group is these 32 countries — the same comparator OECD itself uses for peer reviews. |

## How they are used

These files are not consumed directly by the dashboard. They are read by the data-processing script (`scripts/preprocess.py`) when it builds the compact JSON files in `public/data/`. If any of these reference files changes (for example, a new country joins the DAC or a country graduates from the LDC list), re-run the script and the dashboard updates automatically.

## Replace these with live downloads when you can

These files were hard-coded because the build environment used to assemble this dashboard could not reach the public sources directly. On a normal machine with internet access:

- The Sustainable Development Report 2024 publishes its scoring CSV at https://dashboards.sdgindex.org/downloads
- The UN list of Least Developed Countries is at https://www.un.org/ohrlls/content/list-ldcs
- World Bank country populations are at https://data.worldbank.org/indicator/SP.POP.TOTL
- The OECD Development Assistance Committee's member list is at https://www.oecd.org/dac/dacmembers.htm

Download those, drop them in this folder, and update `preprocess.py` to read the live versions instead of the hard-coded JSON.

## What is *not* in this folder

We deliberately did not pre-download the OECD's own published canonical totals (the table that says "private philanthropy disbursed $X for development in 2022"). That table is the basis for the dashboard's "reconciliation" check — the badge that tells the analyst whether each figure on screen agrees with what OECD has officially published. Building that table requires careful matching of OECD's published categories to our internal pivots, and it is the longest-pole item in the build plan (step C3). If the build runs out of time, the reconciliation falls back to "internal-only" mode, which is honest but less powerful.
