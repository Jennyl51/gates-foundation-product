"""
Preprocess the OECD philanthropy dataset into compact JSON files for the dashboard.

Run from the oecd-dashboard directory:
    python3 scripts/preprocess.py

Reads:
    data/raw/oecd-funding.csv

Writes (to public/data/):
    summary.json                     -- headline numbers
    top-donors.json                  -- top 50 foundations by disbursement
    top-donor-countries.json         -- ranked donor home countries
    top-recipient-countries.json     -- ranked recipient countries
    sectors.json                     -- all sectors with totals
    timeseries-year.json             -- year x sector x region matrix
    markers.json                     -- gender / climate / env / nutrition rollups
    sdg.json                         -- SDG focus rollups
    flow-types.json                  -- domestic vs cross-border by year
    channels.json                    -- delivery channel rollups
    donor-x-country.json             -- donor x recipient country matrix (top slices)
    judge-questions.json             -- pre-baked answers to kickoff deck questions
    donors/{slug}.json               -- per-foundation profile for top donors
    explorer-aggregates.json         -- compact pivot for the explorer page
    legend.json                      -- variable definitions

The dashboard never touches the raw CSV; it consumes only these JSON files.
"""

from __future__ import annotations

import json
import os
import re
import unicodedata
from pathlib import Path

import pandas as pd


# ----------------------------------------------------------------------------
# Paths
# ----------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
RAW_CSV = ROOT / "data" / "raw" / "oecd-funding.csv"
LEGEND_CSV = ROOT / "data" / "raw" / "legend.csv"
OUT_DIR = ROOT / "public" / "data"
DONORS_DIR = OUT_DIR / "donors"

OUT_DIR.mkdir(parents=True, exist_ok=True)
DONORS_DIR.mkdir(parents=True, exist_ok=True)


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------

def slugify(text: str) -> str:
    if text is None:
        return ""
    text = unicodedata.normalize("NFKD", str(text)).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    text = re.sub(r"[-\s]+", "-", text)
    return text


def write_json(name: str, payload):
    path = OUT_DIR / name
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    size_kb = path.stat().st_size / 1024
    print(f"  wrote {name:<32s} {size_kb:>8.1f} KB")


def safe_round(x, n=3):
    try:
        return round(float(x), n)
    except Exception:
        return None


def coerce_year(y):
    """Year column has the special value '2020-2023' for NDA-protected rows."""
    if pd.isna(y):
        return None
    s = str(y).strip()
    if s == "2020-2023":
        return "2020-2023"
    try:
        return int(float(s))
    except Exception:
        return None


# ----------------------------------------------------------------------------
# Load
# ----------------------------------------------------------------------------

print("Loading CSV...")
df = pd.read_csv(RAW_CSV, low_memory=False)
print(f"  {len(df):,} rows, {len(df.columns)} columns")

df["year_clean"] = df["year"].map(coerce_year)
df["year_int"] = df["year_clean"].apply(lambda y: y if isinstance(y, int) else None)
df["disb"] = pd.to_numeric(df["usd_disbursements_defl"], errors="coerce").fillna(0.0)
df["comm"] = pd.to_numeric(df["usd_commitment_defl"], errors="coerce").fillna(0.0)


# ----------------------------------------------------------------------------
# 1. Summary
# ----------------------------------------------------------------------------

print("\nBuilding summary...")
single_year_df = df[df["year_int"].notna()]
years = sorted(single_year_df["year_int"].dropna().unique().tolist())
summary = {
    "rows": int(len(df)),
    "single_year_rows": int(len(single_year_df)),
    "aggregate_rows": int((df["year_clean"] == "2020-2023").sum()),
    "total_disbursement_usd_mn": safe_round(df["disb"].sum(), 1),
    "total_commitment_usd_mn": safe_round(df["comm"].sum(), 1),
    "year_min": int(min(years)) if years else None,
    "year_max": int(max(years)) if years else None,
    "n_foundations": int(df["organization_name"].nunique()),
    "n_donor_countries": int(df["Donor_country"].nunique()),
    "n_recipient_countries": int(df["country"].nunique()),
    "n_sectors": int(df["sector_description"].nunique()),
    "n_subsectors": int(df["subsector_description"].nunique()),
    "share_cross_border": safe_round(
        (df["type_of_flow"] == "Cross-border").sum() / len(df) * 100, 1
    ),
}
write_json("summary.json", summary)


# ----------------------------------------------------------------------------
# 2. Top donors
# ----------------------------------------------------------------------------

print("Building top donors...")
donor_grp = (
    df.groupby("organization_name", dropna=True)
      .agg(
          disbursement=("disb", "sum"),
          commitment=("comm", "sum"),
          n_grants=("disb", "count"),
          donor_country=("Donor_country", lambda s: s.dropna().mode().iloc[0] if not s.dropna().empty else None),
      )
      .reset_index()
      .sort_values("disbursement", ascending=False)
)
top_donors = []
for _, row in donor_grp.head(50).iterrows():
    top_donors.append({
        "name": row["organization_name"],
        "slug": slugify(row["organization_name"]),
        "donor_country": row["donor_country"],
        "disbursement": safe_round(row["disbursement"], 2),
        "commitment": safe_round(row["commitment"], 2),
        "n_grants": int(row["n_grants"]),
    })
write_json("top-donors.json", top_donors)


# ----------------------------------------------------------------------------
# 3. Donor home countries
# ----------------------------------------------------------------------------

print("Building donor countries...")
dc = (
    df.groupby("Donor_country", dropna=True)
      .agg(
          disbursement=("disb", "sum"),
          n_grants=("disb", "count"),
          n_foundations=("organization_name", "nunique"),
      )
      .reset_index()
      .sort_values("disbursement", ascending=False)
)
write_json("top-donor-countries.json", [
    {
        "country": r["Donor_country"],
        "disbursement": safe_round(r["disbursement"], 2),
        "n_grants": int(r["n_grants"]),
        "n_foundations": int(r["n_foundations"]),
    }
    for _, r in dc.iterrows()
])


# ----------------------------------------------------------------------------
# 4. Recipient countries
# ----------------------------------------------------------------------------

print("Building recipient countries...")
rc = (
    df.groupby(["country", "region_macro"], dropna=False)
      .agg(
          disbursement=("disb", "sum"),
          n_grants=("disb", "count"),
          n_donors=("organization_name", "nunique"),
      )
      .reset_index()
      .sort_values("disbursement", ascending=False)
)
write_json("top-recipient-countries.json", [
    {
        "country": r["country"],
        "region_macro": r["region_macro"],
        "disbursement": safe_round(r["disbursement"], 2),
        "n_grants": int(r["n_grants"]),
        "n_donors": int(r["n_donors"]),
    }
    for _, r in rc.iterrows() if pd.notna(r["country"])
])


# ----------------------------------------------------------------------------
# 5. Sectors and subsectors
# ----------------------------------------------------------------------------

print("Building sectors...")
sec = (
    df.groupby("sector_description", dropna=True)
      .agg(
          disbursement=("disb", "sum"),
          n_grants=("disb", "count"),
          n_donors=("organization_name", "nunique"),
      )
      .reset_index()
      .sort_values("disbursement", ascending=False)
)
write_json("sectors.json", [
    {
        "sector": r["sector_description"],
        "disbursement": safe_round(r["disbursement"], 2),
        "n_grants": int(r["n_grants"]),
        "n_donors": int(r["n_donors"]),
    }
    for _, r in sec.iterrows()
])

subsec = (
    df.groupby(["sector_description", "subsector_description"], dropna=True)
      .agg(
          disbursement=("disb", "sum"),
          n_grants=("disb", "count"),
      )
      .reset_index()
      .sort_values("disbursement", ascending=False)
)
write_json("subsectors.json", [
    {
        "sector": r["sector_description"],
        "subsector": r["subsector_description"],
        "disbursement": safe_round(r["disbursement"], 2),
        "n_grants": int(r["n_grants"]),
    }
    for _, r in subsec.iterrows()
])


# ----------------------------------------------------------------------------
# 6. Time series — year x sector x region
# ----------------------------------------------------------------------------

print("Building time series...")
ts_year = (
    single_year_df.groupby("year_int", dropna=True)
      .agg(disbursement=("disb", "sum"), commitment=("comm", "sum"), n_grants=("disb", "count"))
      .reset_index()
      .sort_values("year_int")
)
ts_year_sector = (
    single_year_df.groupby(["year_int", "sector_description"], dropna=True)
      .agg(disbursement=("disb", "sum"))
      .reset_index()
)
ts_year_region = (
    single_year_df.groupby(["year_int", "region_macro"], dropna=True)
      .agg(disbursement=("disb", "sum"))
      .reset_index()
)
ts_year_flow = (
    single_year_df.groupby(["year_int", "type_of_flow"], dropna=True)
      .agg(disbursement=("disb", "sum"))
      .reset_index()
)

write_json("timeseries-year.json", {
    "by_year": [
        {
            "year": int(r["year_int"]),
            "disbursement": safe_round(r["disbursement"], 2),
            "commitment": safe_round(r["commitment"], 2),
            "n_grants": int(r["n_grants"]),
        }
        for _, r in ts_year.iterrows()
    ],
    "by_year_sector": [
        {
            "year": int(r["year_int"]),
            "sector": r["sector_description"],
            "disbursement": safe_round(r["disbursement"], 2),
        }
        for _, r in ts_year_sector.iterrows()
    ],
    "by_year_region": [
        {
            "year": int(r["year_int"]),
            "region": r["region_macro"],
            "disbursement": safe_round(r["disbursement"], 2),
        }
        for _, r in ts_year_region.iterrows()
    ],
    "by_year_flow": [
        {
            "year": int(r["year_int"]),
            "flow": r["type_of_flow"],
            "disbursement": safe_round(r["disbursement"], 2),
        }
        for _, r in ts_year_flow.iterrows()
    ],
})


# ----------------------------------------------------------------------------
# 7. Markers (gender, climate, environment, biodiversity, nutrition)
# ----------------------------------------------------------------------------

print("Building markers...")
MARKER_COLS = [
    ("gender_marker", "Gender equality"),
    ("climate_change_mitigation", "Climate mitigation"),
    ("climate_change_adaptation", "Climate adaptation"),
    ("environment", "Environment"),
    ("biodiversity", "Biodiversity"),
    ("desertification", "Combat desertification"),
    ("nutrition", "Nutrition"),
]


def marker_breakdown(col: str, label: str):
    sub = df[df[col].notna()].copy()
    sub[col] = pd.to_numeric(sub[col], errors="coerce")
    sub = sub[sub[col].isin([0, 1, 2])]
    out = {
        "label": label,
        "code": col,
        "screened_grants": int(len(sub)),
        "screened_disbursement": safe_round(sub["disb"].sum(), 2),
        "by_score": {},
    }
    for score in [0, 1, 2]:
        s = sub[sub[col] == score]
        out["by_score"][str(score)] = {
            "n_grants": int(len(s)),
            "disbursement": safe_round(s["disb"].sum(), 2),
        }
    # principal-objective top sectors (score=2)
    principal = sub[sub[col] == 2]
    top_sec = (
        principal.groupby("sector_description")["disb"]
        .sum().sort_values(ascending=False).head(5)
    )
    out["principal_top_sectors"] = [
        {"sector": k, "disbursement": safe_round(v, 2)}
        for k, v in top_sec.items()
    ]
    # top donors for principal-objective
    top_d = (
        principal.groupby("organization_name")["disb"]
        .sum().sort_values(ascending=False).head(5)
    )
    out["principal_top_donors"] = [
        {"name": k, "slug": slugify(k), "disbursement": safe_round(v, 2)}
        for k, v in top_d.items()
    ]
    return out


markers_payload = [marker_breakdown(c, l) for c, l in MARKER_COLS]
write_json("markers.json", markers_payload)


# ----------------------------------------------------------------------------
# 8. SDG focus
# ----------------------------------------------------------------------------

print("Building SDGs...")
sdg_rows = df[["sdg_focus", "disb", "organization_name", "country"]].copy()
sdg_rows = sdg_rows.dropna(subset=["sdg_focus"])
exploded = []
for _, r in sdg_rows.iterrows():
    raw = str(r["sdg_focus"])
    targets = [t.strip() for t in re.split(r"[;,]", raw) if t.strip()]
    seen = set()
    for t in targets:
        # Extract goal number from "x.y"
        m = re.match(r"(\d+)", t)
        if not m:
            continue
        goal = int(m.group(1))
        if goal in seen or goal < 1 or goal > 17:
            continue
        seen.add(goal)
        exploded.append({"goal": goal, "disb": r["disb"]})

if exploded:
    sdg_df = pd.DataFrame(exploded)
    sdg_grp = sdg_df.groupby("goal").agg(
        disbursement=("disb", "sum"),
        n_grants=("disb", "count"),
    ).reset_index().sort_values("goal")
    write_json("sdg.json", [
        {
            "goal": int(r["goal"]),
            "disbursement": safe_round(r["disbursement"], 2),
            "n_grants": int(r["n_grants"]),
        }
        for _, r in sdg_grp.iterrows()
    ])
else:
    write_json("sdg.json", [])


# ----------------------------------------------------------------------------
# 9. Flow types and channels
# ----------------------------------------------------------------------------

print("Building flow types & channels...")
flow = (
    df.groupby("type_of_flow", dropna=False)
      .agg(disbursement=("disb", "sum"), n_grants=("disb", "count"))
      .reset_index()
)
write_json("flow-types.json", [
    {
        "flow": (r["type_of_flow"] if pd.notna(r["type_of_flow"]) else "Unspecified"),
        "disbursement": safe_round(r["disbursement"], 2),
        "n_grants": int(r["n_grants"]),
    }
    for _, r in flow.iterrows()
])

channels = (
    df[df["channel_name"].notna()].groupby("channel_name")
      .agg(disbursement=("disb", "sum"), n_grants=("disb", "count"))
      .reset_index()
      .sort_values("disbursement", ascending=False)
      .head(25)
)
write_json("channels.json", [
    {
        "channel": r["channel_name"],
        "disbursement": safe_round(r["disbursement"], 2),
        "n_grants": int(r["n_grants"]),
    }
    for _, r in channels.iterrows()
])


# ----------------------------------------------------------------------------
# 10. Donor profiles (top 50)
# ----------------------------------------------------------------------------

print("Building donor profiles...")
top_50_donors = donor_grp.head(50)["organization_name"].tolist()
for donor in top_50_donors:
    sub = df[df["organization_name"] == donor]
    profile = {
        "name": donor,
        "slug": slugify(donor),
        "donor_country": (
            sub["Donor_country"].dropna().mode().iloc[0]
            if not sub["Donor_country"].dropna().empty else None
        ),
        "n_grants": int(len(sub)),
        "disbursement": safe_round(sub["disb"].sum(), 2),
        "commitment": safe_round(sub["comm"].sum(), 2),
        "by_year": [
            {"year": int(r["year_int"]), "disbursement": safe_round(r["disb"], 2)}
            for _, r in (
                sub[sub["year_int"].notna()]
                .groupby("year_int")["disb"].sum().reset_index().sort_values("year_int")
            ).iterrows()
        ],
        "by_country": [
            {"country": k, "disbursement": safe_round(v, 2)}
            for k, v in sub.groupby("country")["disb"].sum()
                .sort_values(ascending=False).head(15).items()
        ],
        "by_region": [
            {"region": k, "disbursement": safe_round(v, 2)}
            for k, v in sub.groupby("region_macro")["disb"].sum()
                .sort_values(ascending=False).items()
        ],
        "by_sector": [
            {"sector": k, "disbursement": safe_round(v, 2)}
            for k, v in sub.groupby("sector_description")["disb"].sum()
                .sort_values(ascending=False).head(10).items()
        ],
        "flow_split": [
            {"flow": k, "disbursement": safe_round(v, 2)}
            for k, v in sub.groupby("type_of_flow")["disb"].sum().items()
        ],
        "sample_grants": [
            {
                "year": (int(r["year_int"]) if pd.notna(r["year_int"]) else None),
                "country": r.get("country"),
                "sector": r.get("sector_description"),
                "title": r.get("grant_recipient_project_title"),
                "description": (str(r.get("project_description"))[:240] if pd.notna(r.get("project_description")) else None),
                "disbursement": safe_round(r["disb"], 3),
            }
            for _, r in sub.nlargest(8, "disb").iterrows()
        ],
    }
    slug = slugify(donor)
    with (DONORS_DIR / f"{slug}.json").open("w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, separators=(",", ":"))

print(f"  wrote {len(top_50_donors)} donor profile(s) to public/data/donors/")


# ----------------------------------------------------------------------------
# 11. Donor x recipient country matrix (compact)
# ----------------------------------------------------------------------------

print("Building donor x recipient matrix...")
# Top 30 donors x top 30 recipients
top_d = donor_grp.head(30)["organization_name"].tolist()
top_c = rc.head(30)["country"].tolist()
sub = df[df["organization_name"].isin(top_d) & df["country"].isin(top_c)]
matrix = (
    sub.groupby(["organization_name", "country"])["disb"].sum().reset_index()
)
write_json("donor-x-country.json", {
    "donors": top_d,
    "countries": top_c,
    "cells": [
        {
            "donor": r["organization_name"],
            "country": r["country"],
            "disbursement": safe_round(r["disb"], 3),
        }
        for _, r in matrix.iterrows()
        if r["disb"] > 0
    ],
})


# ----------------------------------------------------------------------------
# 12. Pre-baked answers to the kickoff deck's sample questions
# ----------------------------------------------------------------------------

print("Building judge questions...")


def top_donors_in_country(donor_country: str, n: int = 10):
    sub = df[df["Donor_country"] == donor_country]
    g = sub.groupby("organization_name")["disb"].sum().sort_values(ascending=False).head(n)
    return [{"name": k, "slug": slugify(k), "disbursement": safe_round(v, 2)} for k, v in g.items()]


def top_countries_for_subsector_keyword(keyword: str, n: int = 5):
    mask = df["subsector_description"].fillna("").str.contains(keyword, case=False, na=False) | \
           df["sector_description"].fillna("").str.contains(keyword, case=False, na=False)
    sub = df[mask]
    g = sub.groupby("country")["disb"].sum().sort_values(ascending=False).head(n)
    return [{"country": k, "disbursement": safe_round(v, 2)} for k, v in g.items()]


def climatech_over_time():
    # Use climate mitigation / adaptation principal-objective rows
    mask = (
        (pd.to_numeric(df["climate_change_mitigation"], errors="coerce") >= 1)
        | (pd.to_numeric(df["climate_change_adaptation"], errors="coerce") >= 1)
    )
    sub = df[mask & df["year_int"].notna()]
    g = sub.groupby("year_int")["disb"].sum().sort_values()
    return [{"year": int(k), "disbursement": safe_round(v, 2)} for k, v in g.sort_index().items()]


def top_donors_for_subsector_in_country(country: str, keyword: str, n: int = 5):
    mask = (
        (df["country"] == country)
        & (
            df["subsector_description"].fillna("").str.contains(keyword, case=False, na=False)
            | df["sector_description"].fillna("").str.contains(keyword, case=False, na=False)
        )
    )
    sub = df[mask]
    g = sub.groupby("organization_name")["disb"].sum().sort_values(ascending=False).head(n)
    return [{"name": k, "slug": slugify(k), "disbursement": safe_round(v, 2)} for k, v in g.items()]


judge_questions = [
    {
        "id": "uk-top-donors",
        "question": "What are the top donors based out of the United Kingdom?",
        "answer": top_donors_in_country("United Kingdom"),
        "answer_type": "donor_list",
        "unit": "USD millions, 2023 deflated",
    },
    {
        "id": "maternal-health-top-countries",
        "question": "Which 5 countries receive the most funding for maternal health?",
        "answer": top_countries_for_subsector_keyword("maternal", 5),
        "answer_type": "country_list",
        "unit": "USD millions, 2023 deflated",
    },
    {
        "id": "reproductive-health-top-countries",
        "question": "Which countries receive the most funding for reproductive health?",
        "answer": top_countries_for_subsector_keyword("reproductive", 5),
        "answer_type": "country_list",
        "unit": "USD millions, 2023 deflated",
    },
    {
        "id": "climate-over-time",
        "question": "How has global funding for climate (mitigation + adaptation) changed over time?",
        "answer": climatech_over_time(),
        "answer_type": "timeseries",
        "unit": "USD millions, 2023 deflated",
    },
    {
        "id": "infectious-disease-india",
        "question": "Which donor gives the most for infectious diseases in India?",
        "answer": top_donors_for_subsector_in_country("India", "infectious", 5),
        "answer_type": "donor_list",
        "unit": "USD millions, 2023 deflated",
    },
]
write_json("judge-questions.json", judge_questions)


# ----------------------------------------------------------------------------
# 13. Explorer compact aggregates
# ----------------------------------------------------------------------------

print("Building explorer aggregates...")
# A multi-key pivot: (year, donor_country, region_macro, sector_description) -> totals
explorer = (
    df.groupby(
        ["year_clean", "Donor_country", "region_macro", "sector_description"],
        dropna=False,
    ).agg(disb=("disb", "sum"), n=("disb", "count")).reset_index()
)
explorer = explorer[explorer["disb"] > 0]
explorer["year_clean"] = explorer["year_clean"].astype(str)
write_json("explorer-aggregates.json", {
    "rows": [
        {
            "y": str(r["year_clean"]) if pd.notna(r["year_clean"]) else None,
            "dc": r["Donor_country"] if pd.notna(r["Donor_country"]) else None,
            "rm": r["region_macro"] if pd.notna(r["region_macro"]) else None,
            "s": r["sector_description"] if pd.notna(r["sector_description"]) else None,
            "v": safe_round(r["disb"], 3),
            "n": int(r["n"]),
        }
        for _, r in explorer.iterrows()
    ],
})


# ----------------------------------------------------------------------------
# 14. Legend (variable definitions)
# ----------------------------------------------------------------------------

print("Building legend...")
try:
    legend_df = pd.read_csv(LEGEND_CSV, header=None)
    # Find rows with 4 cols where col 2 is variable name and col 3 is description
    legend = []
    for _, row in legend_df.iterrows():
        if len(row) >= 4 and pd.notna(row.iloc[2]) and pd.notna(row.iloc[3]):
            name = str(row.iloc[2]).strip()
            desc = str(row.iloc[3]).strip()
            if name.lower() == "variable name":
                continue
            legend.append({"variable": name, "description": desc})
    write_json("legend.json", legend)
except Exception as e:
    print(f"  legend: {e}")
    write_json("legend.json", [])


# ============================================================================
# C2 ADDITIONS — outside-data joins + decision-intelligence aggregations
# ============================================================================
#
# Loads four external reference tables (LDC list, populations, DAC members,
# SDG world-need scores) plus the unified country-alias map, and produces
# five new JSON files that drive the decision-intelligence pages:
#
#   misalignment.json          — world-level + LDC-tier misalignment (M1, M1b)
#   country-profiles/{slug}.json — per-donor-country profile (M3, M4, M5, M11)
#   peer-comparators.json      — each donor country's deltas vs DAC average (M4)
#   concentration.json         — Herfindahl index per (sector, country) slice (M12)
#   simpsons-flags.json        — slices whose trend reverses by flow type (M13)
#
# Unmatched country names are logged to stderr so we can patch the alias map.
# ============================================================================

import sys

EXTERNAL_DIR = ROOT / "data" / "external"


def load_external(name):
    with (EXTERNAL_DIR / name).open("r", encoding="utf-8") as f:
        return json.load(f)


print("\n--- C2 additions ---")
print("Loading external references...")
ext_aliases = load_external("country-aliases.json")
ext_ldc = load_external("least-developed-countries.json")
ext_pop = load_external("country-populations.json")
ext_dac = load_external("dac-members.json")
ext_sdg = load_external("sdg-need-scores.json")

# ----- Build an alias-resolution map: any name -> canonical
alias_to_canon: dict[str, str] = {}
for canon, alts in ext_aliases["aliases"].items():
    alias_to_canon[canon.lower()] = canon
    for alt in alts:
        alias_to_canon[alt.lower()] = canon

# Add LDC name overrides into the alias map
for canon, alts in ext_ldc["name_overrides"].items():
    alias_to_canon[canon.lower()] = canon
    for alt in alts:
        alias_to_canon[alt.lower()] = canon

# Add DAC name overrides
for canon, alts in ext_dac["name_overrides"].items():
    alias_to_canon[canon.lower()] = canon
    for alt in alts:
        alias_to_canon[alt.lower()] = canon

skip_as_country = set(s.lower() for s in ext_aliases["skip_as_country"])

unmatched_log: set[str] = set()


def normalize_country(name):
    if not isinstance(name, str) or not name.strip():
        return None
    n = name.strip()
    # multi-country grants (semicolon-joined) — skip; rare anyway
    if ";" in n:
        return None
    if n.lower() in skip_as_country:
        return None
    if n.lower() in alias_to_canon:
        return alias_to_canon[n.lower()]
    # not aliased and not a regional code → assume canonical, log first time
    if n.lower() not in unmatched_log:
        unmatched_log.add(n.lower())
    return n


# Apply normalisation to a working copy
df["country_norm"] = df["country"].apply(normalize_country)
df["donor_country_norm"] = df["Donor_country"].apply(normalize_country)

# ----- Build helper sets/dicts
ldc_set = set(ext_ldc["countries"])
ldc_set_lower = set(c.lower() for c in ldc_set)
# Resolve LDC names through the alias map
ldc_canonical = set()
for c in ldc_set:
    canon = alias_to_canon.get(c.lower(), c)
    ldc_canonical.add(canon)

dac_set = set(ext_dac["members"])
dac_canonical = set()
for c in dac_set:
    canon = alias_to_canon.get(c.lower(), c)
    dac_canonical.add(canon)

pop_map = {}
for k, v in ext_pop["populations_millions"].items():
    canon = alias_to_canon.get(k.lower(), k)
    pop_map[canon] = float(v)

sdg_scores = {row["goal"]: row for row in ext_sdg["scores"]}


# ----- 15. Misalignment (M1: world-level, M1b: LDC tier) ------------------
print("Building misalignment (world + LDC tier)...")

# 15a. World-level Misalignment Index
# phil_share(G) = $ tagged with goal G / $ tagged with any goal
# need_share(G) = distance_to_need(G) / Σ distance_to_need across all goals
sdg_phil = {}  # goal -> $
for _, r in df.iterrows():
    raw = r.get("sdg_focus")
    if pd.isna(raw):
        continue
    targets = [t.strip() for t in re.split(r"[;,]", str(raw)) if t.strip()]
    seen = set()
    disb = float(r["disb"])
    for t in targets:
        m = re.match(r"(\d+)", t)
        if not m:
            continue
        goal = int(m.group(1))
        if goal < 1 or goal > 17 or goal in seen:
            continue
        seen.add(goal)
        sdg_phil[goal] = sdg_phil.get(goal, 0.0) + disb

total_phil_tagged = sum(sdg_phil.values())
total_need = sum(sdg_scores[g]["distance_to_need"] for g in range(1, 18))

world_misalignment = []
for goal in range(1, 18):
    phil_share = (sdg_phil.get(goal, 0.0) / total_phil_tagged) if total_phil_tagged else 0.0
    need_share = sdg_scores[goal]["distance_to_need"] / total_need if total_need else 0.0
    delta_pp = (phil_share - need_share) * 100
    world_misalignment.append({
        "goal": goal,
        "name": sdg_scores[goal]["name"],
        "phil_disbursement_usd_mn": safe_round(sdg_phil.get(goal, 0.0), 2),
        "phil_share_pct": safe_round(phil_share * 100, 2),
        "need_share_pct": safe_round(need_share * 100, 2),
        "delta_pp": safe_round(delta_pp, 2),
        "verdict": (
            "underfunded" if delta_pp <= -2 else
            "overfunded" if delta_pp >= 2 else
            "aligned"
        ),
    })

# 15b. LDC-tier misalignment
# phil_to_ldc_share = $ to LDCs / $ to all named recipient countries (excluding regional)
# pop_in_ldc_share  = LDC population / total population among named recipient countries
named_df = df[df["country_norm"].notna()]
phil_ldc = float(named_df[named_df["country_norm"].isin(ldc_canonical)]["disb"].sum())
phil_named_total = float(named_df["disb"].sum())
phil_ldc_share = phil_ldc / phil_named_total if phil_named_total else 0.0

ldc_pop_total = sum(pop_map.get(c, 0.0) for c in ldc_canonical)
named_recip_countries = set(named_df["country_norm"].dropna().unique())
named_pop_total = sum(pop_map.get(c, 0.0) for c in named_recip_countries if c in pop_map)
pop_ldc_share = ldc_pop_total / named_pop_total if named_pop_total else 0.0

ldc_misalignment = {
    "phil_to_ldc_usd_mn": safe_round(phil_ldc, 2),
    "phil_named_total_usd_mn": safe_round(phil_named_total, 2),
    "phil_to_ldc_share_pct": safe_round(phil_ldc_share * 100, 2),
    "ldc_population_share_pct": safe_round(pop_ldc_share * 100, 2),
    "delta_pp": safe_round((phil_ldc_share - pop_ldc_share) * 100, 2),
    "n_ldc_countries_in_data": len(ldc_canonical & named_recip_countries),
    "n_ldc_countries_total": len(ldc_canonical),
    "verdict": (
        "underfunded" if (phil_ldc_share - pop_ldc_share) <= -0.02 else
        "overfunded"  if (phil_ldc_share - pop_ldc_share) >= 0.02 else
        "aligned"
    ),
}

write_json("misalignment.json", {
    "world_level": world_misalignment,
    "ldc_tier": ldc_misalignment,
    "method_note": (
        "World-level: dollars tagged per UN goal vs the world's distance-to-target "
        "share of overall need. LDC-tier: dollars to the 46 UN-listed Least "
        "Developed Countries vs the LDC share of total population among named "
        "recipient countries. Both lenses exclude grants without a country tag."
    ),
})


# ----- 16. Per-donor-country profiles --------------------------------------
print("Building per-donor-country profiles...")
COUNTRY_PROFILES_DIR = OUT_DIR / "countries"
COUNTRY_PROFILES_DIR.mkdir(parents=True, exist_ok=True)

country_norm_donor_df = df[df["donor_country_norm"].notna()].copy()
donor_countries = country_norm_donor_df["donor_country_norm"].unique().tolist()

# Pre-compute DAC averages for the comparator
dac_donor_df = country_norm_donor_df[country_norm_donor_df["donor_country_norm"].isin(dac_canonical)]

def share_by(df_in, key, total_col="disb"):
    grp = df_in.groupby(key)[total_col].sum()
    total = grp.sum()
    if total == 0:
        return {}
    return {k: float(v) / total for k, v in grp.items() if pd.notna(k)}

dac_sector_share = share_by(dac_donor_df, "sector_description")
dac_region_share = share_by(dac_donor_df, "region_macro")
dac_channel_share = share_by(dac_donor_df[dac_donor_df["channel_name"].notna()], "channel_name")
dac_flow_share   = share_by(dac_donor_df, "type_of_flow")

peer_summaries = []  # for peer-comparators.json

for donor in donor_countries:
    sub = country_norm_donor_df[country_norm_donor_df["donor_country_norm"] == donor]
    if len(sub) < 5:
        continue
    is_dac = donor in dac_canonical
    total_disb = float(sub["disb"].sum())
    n_grants = int(len(sub))
    n_foundations = int(sub["organization_name"].nunique())

    sector_share = share_by(sub, "sector_description")
    region_share = share_by(sub, "region_macro")
    channel_share = share_by(sub[sub["channel_name"].notna()], "channel_name")
    flow_share = share_by(sub, "type_of_flow")

    cb_share = flow_share.get("Cross-border", 0.0)
    flow_unspec = 1.0 - sum(v for k, v in flow_share.items() if k in ("Cross-border", "Domestic"))

    # peer deltas
    def deltas(sub_share, dac_share, top_n=10):
        items = []
        all_keys = set(sub_share.keys()) | set(dac_share.keys())
        for k in all_keys:
            s = sub_share.get(k, 0.0)
            d = dac_share.get(k, 0.0)
            items.append({"label": k, "country_share_pct": round(s * 100, 2),
                          "dac_avg_share_pct": round(d * 100, 2),
                          "delta_pp": round((s - d) * 100, 2)})
        items.sort(key=lambda x: abs(x["delta_pp"]), reverse=True)
        return items[:top_n]

    sector_deltas = deltas(sector_share, dac_sector_share)
    region_deltas = deltas(region_share, dac_region_share)
    channel_deltas = deltas(channel_share, dac_channel_share)

    # top recipients
    top_recipients = (
        sub[sub["country_norm"].notna()].groupby("country_norm")["disb"].sum()
        .sort_values(ascending=False).head(10)
    )

    # year trend
    by_year = (
        sub[sub["year_int"].notna()].groupby("year_int")["disb"].sum()
        .sort_index()
    )

    profile = {
        "country": donor,
        "slug": slugify(donor),
        "is_dac_member": is_dac,
        "total_disbursement_usd_mn": safe_round(total_disb, 2),
        "n_grants": n_grants,
        "n_foundations": n_foundations,
        "cross_border_share_pct": safe_round(cb_share * 100, 2),
        "domestic_share_pct": safe_round((1 - cb_share - flow_unspec) * 100, 2),
        "flow_unspecified_share_pct": safe_round(flow_unspec * 100, 2),
        "by_year": [
            {"year": int(y), "disbursement": safe_round(v, 2)}
            for y, v in by_year.items()
        ],
        "top_sectors": [
            {"sector": k, "share_pct": safe_round(v * 100, 2),
             "disbursement": safe_round(v * total_disb, 2)}
            for k, v in sorted(sector_share.items(), key=lambda x: -x[1])[:10]
        ],
        "top_recipients": [
            {"country": k, "disbursement": safe_round(v, 2)}
            for k, v in top_recipients.items()
        ],
        "peer_comparison": {
            "peer_group": "OECD-DAC member countries" if is_dac else "OECD-DAC member countries (non-DAC reference)",
            "n_peers": len(dac_canonical),
            "sector_deltas": sector_deltas,
            "region_deltas": region_deltas,
            "channel_deltas": channel_deltas,
        },
        "_caveat": (
            (
                "Comparator group is the OECD-DAC member countries. "
                + ("Total disbursement under $100M — peer deltas are directional only." if total_disb < 100 else "")
            ).strip()
            if is_dac else
            "This country is not a DAC member; its profile is shown for completeness but the peer-delta interpretation is informational, not normative."
        ),
    }

    with (COUNTRY_PROFILES_DIR / f"{slugify(donor)}.json").open("w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, separators=(",", ":"))

    # Honest split: positive = over-allocated vs DAC, negative = under-allocated.
    # Either may be empty (a country may under-spend in *every* category).
    positives = [d for d in sector_deltas if d["delta_pp"] > 0]
    negatives = [d for d in sector_deltas if d["delta_pp"] < 0]
    biggest_over = max(positives, key=lambda x: x["delta_pp"]) if positives else None
    biggest_under = min(negatives, key=lambda x: x["delta_pp"]) if negatives else None

    # Stability flag: peer-deltas under ~$100M total disbursement are noisy
    stable_peer = total_disb >= 100

    peer_summaries.append({
        "country": donor,
        "slug": slugify(donor),
        "is_dac": is_dac,
        "total_disbursement_usd_mn": safe_round(total_disb, 2),
        "stable_peer_comparison": stable_peer,
        "stability_note": (
            None if stable_peer else
            "Total disbursement under $100M — sector deltas vs DAC average are noisy and should be read as directional only."
        ),
        "biggest_overallocation_vs_dac": biggest_over,
        "biggest_underallocation_vs_dac": biggest_under,
    })

print(f"  wrote {len(donor_countries)} country profile(s) to public/data/countries/")
write_json("peer-comparators.json", peer_summaries)


# ----- 17. Concentration (Herfindahl) per (sector, country) ----------------
print("Building concentration index per slice...")
concentration = []
slice_grp = df[df["country_norm"].notna() & df["sector_description"].notna()].groupby(
    ["sector_description", "country_norm"]
)
for (sec, country), grp in slice_grp:
    total = float(grp["disb"].sum())
    if total <= 0 or len(grp) < 3:
        continue
    donor_shares = grp.groupby("organization_name")["disb"].sum() / total
    hhi = float(((donor_shares ** 2) * 10000).sum())
    n_donors = int((donor_shares > 0).sum())
    top_donor_share = float(donor_shares.max() * 100)
    top_donor_name = donor_shares.idxmax()
    concentration.append({
        "sector": sec,
        "country": country,
        "disbursement_usd_mn": safe_round(total, 2),
        "n_donors": n_donors,
        "top_donor": top_donor_name,
        "top_donor_share_pct": safe_round(top_donor_share, 2),
        "hhi": safe_round(hhi, 1),
        "concentration_band": (
            "high" if hhi >= 2500 else
            "moderate" if hhi >= 1500 else
            "low"
        ),
    })
concentration.sort(key=lambda x: -x["disbursement_usd_mn"])
write_json("concentration.json", concentration[:300])  # cap at top 300


# ----- 18. Simpson's-paradox flag per (sector, region) over time -----------
print("Building Simpson's-paradox flags...")
simpsons_flags = []
sub_for_simpson = df[df["year_int"].notna() & df["sector_description"].notna()]
for (sec, region), grp in sub_for_simpson.groupby(["sector_description", "region_macro"]):
    if len(grp) < 100:
        continue
    yearly = grp.groupby("year_int")["disb"].sum().sort_index()
    if len(yearly) < 3:
        continue
    overall_slope = float(yearly.iloc[-1] - yearly.iloc[0])
    cb = grp[grp["type_of_flow"] == "Cross-border"].groupby("year_int")["disb"].sum().sort_index()
    do = grp[grp["type_of_flow"] == "Domestic"].groupby("year_int")["disb"].sum().sort_index()
    if len(cb) < 3 or len(do) < 3:
        continue
    cb_slope = float(cb.iloc[-1] - cb.iloc[0])
    do_slope = float(do.iloc[-1] - do.iloc[0])
    # Flag when overall sign disagrees with one of the subgroups
    if (overall_slope > 0 and (cb_slope < 0 or do_slope < 0)) or \
       (overall_slope < 0 and (cb_slope > 0 or do_slope > 0)):
        simpsons_flags.append({
            "sector": sec,
            "region": region,
            "n_grants": int(len(grp)),
            "overall_change_usd_mn": safe_round(overall_slope, 2),
            "cross_border_change_usd_mn": safe_round(cb_slope, 2),
            "domestic_change_usd_mn": safe_round(do_slope, 2),
            "verdict": (
                "headline trend reverses when split by flow type — "
                "report subgroup figures, not the headline"
            ),
        })
simpsons_flags.sort(key=lambda x: -abs(x["overall_change_usd_mn"]))
write_json("simpsons-flags.json", simpsons_flags[:50])


# ----- 19. Alias-match diagnostics -----------------------------------------
unmatched_sorted = sorted(unmatched_log)
print(f"\nUnmatched country names (first time seen, will pass through as-is):")
if unmatched_sorted:
    for n in unmatched_sorted[:50]:
        print(f"  {n}")
    if len(unmatched_sorted) > 50:
        print(f"  ... and {len(unmatched_sorted) - 50} more")
else:
    print("  (none — all country names matched the alias map)")

write_json("alias-diagnostics.json", {
    "unmatched_count": len(unmatched_sorted),
    "unmatched_names": unmatched_sorted,
    "n_aliases_loaded": len(alias_to_canon),
    "n_skip_as_country": len(skip_as_country),
})


print("\nDone.")
