# OECD Decision Atlas

Spring 2026 Case Competition. Product Track. A reading of the OECD philanthropy database, framed for the policy analyst's brief.

Team: Ayah, Maxime, Jenny.

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

Open an issue in this repo, or add a comment to the team Slack thread. Most useful feedback:

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
- Charts are hand-rolled SVG (no chart library). See `components/`.
- Data preparation is `scripts/preprocess.py`. CSV in, JSON out.
- Trust badge component (`components/trust-badge.tsx`) wraps every number rendered.
- Scaffold component (`components/scaffold.tsx`) is the claim/evidence/caveat block.

---

## Status

Build is clean: TypeScript and ESLint at zero. 58 static pages generate.

Pending: visual critique on a real laptop, demo deck, optional country-by-goal SDG data swap-in, optional canonical reconciliation matrix.
