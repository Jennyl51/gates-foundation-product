# Next Session Plan

Five hours of human time. Usage limit unknown. This plan is **chunked into independent phases**: pick from the top, stop when usage runs out, no phase depends on a later one. Each phase has a clear outcome and a skip-if-tight rule.

Read `SESSION-RESUME.md` first for context, then start with Phase A.

---

## Order of value

| # | Phase | Token cost | Human cost | Demo impact | Skip-if-tight rule |
|---|---|---|---|---|---|
| A | Visual critique with screenshots, then fix the top 3 issues | ~25% | 30 min | High | Skip if you can do the eyeball review yourself |
| B | Build the 8-slide demo deck from the talk track | ~25% | 20 min | High | Skip if a teammate volunteers, the talk track is in `working/06-demo-acceptance.md` and is enough to wing it |
| C | Delete v1 leftovers (`/donors`, `/insights`) and clean up nav | ~10% | 5 min | Low | Skip; harmless to leave |
| D | Optional polish: country-by-goal SDG data, methodology updates | ~15% | 30 min | Medium | Skip; current "world average" lens is defensible |
| E | Vercel deploy after the GitHub push | ~5% | 5 min | High (one URL beats local) | Do this first if push completed in this session |
| Reserve | Demo-day fixes, surprise issues | ~20% | — | — | always hold this back |

---

## Phase A — Visual critique (the most-likely-to-need-it)

**Goal:** Find and fix the worst 3 readability or layout issues before the live demo.

**Steps in next session:**

1. Open `~/gates-repo/oecd-dashboard` (the cloned repo, not the ZIP).
2. Run `npm run dev`. Open `http://localhost:3000`.
3. Take **5 screenshots**: homepage, `/diagnose/sdg`, `/country` (index), one `/country/[slug]` (try `united-states` and `mexico`), `/explore` with two filters applied.
4. Drop the screenshots into a new chat. Tell me: "find the 3 worst issues, fix them."
5. I'll respond with a triaged fix list and code edits.

**What I will look for (from the binding rules):**

- Anything reading as marketing copy.
- Trust badges missing on figures.
- Foundation-reader callouts missing on scaffolds.
- Low-contrast text or visually weak headers.
- Pages that don't end in a clear claim.

**Stop condition:** If usage remaining is under 30%, skip the screenshot critique and ask me directly: "review the homepage and `/diagnose/sdg` text, no screenshot, just check the code." Cheaper but blinder.

---

## Phase B — Demo deck

**Goal:** Eight slides that survive the 5-minute live demo if the laptop fails.

**Steps in next session:**

1. Confirm the talk track in `working/06-demo-acceptance.md` is still right (might have shifted after Phase A).
2. Tell me: "build the 8-slide deck from working/06 and the screenshots."
3. I'll produce a `.pptx` saved to `outputs/`.

**Slide outline (already locked in working/06):**

1. Hook + persona
2. Diagnosis 1: SDG misalignment (with screenshot)
3. Diagnosis 2: country profile (with screenshot)
4. Diagnosis 3: ad-hoc query (with screenshot)
5. Defensibility: methodology + Simpson's flag
6. Differentiation vs QWIDS / IATI / Datalab
7. Limitations honestly listed
8. What we'd build next, plus thank you

**Stop condition:** If usage is under 25%, skip the deck. The talk track is enough to demo from the laptop directly.

---

## Phase C — Delete v1 leftovers

**Goal:** Remove `app/donors/`, `app/insights/`, and the unused loaders in `lib/data.ts`. Keeps the codebase tight for any judge who looks at it.

**Steps in next session:**

1. Tell me: "delete the v1 leftovers." I'll do it in one pass.
2. Run TypeScript and ESLint to confirm clean.

**Stop condition:** Skip if usage is under 15%. Leftover pages don't appear in nav and don't hurt the demo.

---

## Phase D — Country-by-goal SDG data swap-in (stretch only)

**Goal:** Lift the goal-alignment lens from world-average need to country-level need. Adds a real third lens.

**Steps in next session:**

1. On a normal laptop with internet, download the SDR2024 country-by-goal CSV from `https://dashboards.sdgindex.org/downloads`.
2. Drop it into `data/external/sdr2024-country-goal.csv`.
3. Tell me: "extend preprocess.py to use the country-level SDR scores."
4. I'll add a third lens to `app/diagnose/sdg/page.tsx`.

**Stop condition:** Skip unless you have at least 30% usage left. The world-average lens is defensible on its own.

---

## Phase E — Vercel deploy (do first if GitHub push completed)

**Goal:** One URL the judges can open during the demo, in case local fails.

**Steps in next session:**

1. Go to vercel.com, sign in with GitHub.
2. New Project → import `Jennyl51/gates-foundation-product`.
3. Set the project root to `oecd-dashboard/`.
4. No env vars. Default build command. Click Deploy.
5. Test the live URL, link from the kickoff demo notes.

**No tokens needed.** This is fully on the user's side.

---

## Token budget recommendation

If you have 100% of a fresh session to spend:

```
Phase A  25%   — visual critique + 3 fixes
Phase B  25%   — demo deck
Phase E   0%   — deploy (no tokens)
Phase C  10%   — cleanup
Phase D  15%   — country-level SDG (only if comfortable)
Reserve  25%   — demo-day surprises
```

If you only have 50%:

```
Phase A  25%   — critical
Phase B   0%   — defer; talk track is enough
Phase E   0%   — deploy
Reserve  25%   — surprises
```

If you have under 30%:

```
Phase A   0%   — eyeball it yourself
Reserve  30%   — only fix issues you find that you cannot diagnose
```

---

## Anti-drift checklist before any code change

Before I write a line of code in the next session:

1. Open this file. Confirm the phase you're in.
2. Open `working/SESSION-RESUME.md`. Confirm none of the locked decisions have shifted.
3. Open `working/06-demo-acceptance.md`. Confirm the talk track still represents what you want to show.
4. Then ask me what you want done. Specific, scoped, one phase at a time.

---

## What I will not do without an explicit request

- Add new pages.
- Change the persona.
- Re-skin the visual design.
- Change the trust-tier system.
- Add new agents to the workflow.
- Write more planning gates.

If a fresh idea surfaces mid-session, write it down and bring it back later. Do not let it expand the build.

---

## Final words for next session

The code is in good shape. The decisions are locked. The talk track exists. The README is teammate-ready. The biggest remaining risk is the visual review — looking at the dashboard with fresh eyes, on a real laptop, with real fonts, will surface things the build environment could not.

Open the dashboard. Click through it for 10 minutes with a critical eye. Then come back and tell me the three things that bug you most.
