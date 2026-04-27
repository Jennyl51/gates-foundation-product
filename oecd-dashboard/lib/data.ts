// Server-side data loaders. The dashboard reads the pre-aggregated JSONs
// produced by scripts/preprocess.py — never the raw CSV at runtime.
//
// Files live under public/data/ so they could also be fetched by the
// browser, but on the server we read them directly from disk for zero-RTT
// page renders.

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

async function readJson<T>(name: string): Promise<T> {
  const filePath = path.join(DATA_DIR, name);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export type Summary = {
  rows: number;
  single_year_rows: number;
  aggregate_rows: number;
  total_disbursement_usd_mn: number;
  total_commitment_usd_mn: number;
  year_min: number;
  year_max: number;
  n_foundations: number;
  n_donor_countries: number;
  n_recipient_countries: number;
  n_sectors: number;
  n_subsectors: number;
  share_cross_border: number;
};

export type DonorRow = {
  name: string;
  slug: string;
  donor_country: string | null;
  disbursement: number;
  commitment: number;
  n_grants: number;
};

export type CountryRow = {
  country: string;
  region_macro: string | null;
  disbursement: number;
  n_grants: number;
  n_donors: number;
};

export type DonorCountryRow = {
  country: string;
  disbursement: number;
  n_grants: number;
  n_foundations: number;
};

export type SectorRow = {
  sector: string;
  disbursement: number;
  n_grants: number;
  n_donors: number;
};

export type Subsector = {
  sector: string;
  subsector: string;
  disbursement: number;
  n_grants: number;
};

export type Timeseries = {
  by_year: { year: number; disbursement: number; commitment: number; n_grants: number }[];
  by_year_sector: { year: number; sector: string; disbursement: number }[];
  by_year_region: { year: number; region: string; disbursement: number }[];
  by_year_flow: { year: number; flow: string; disbursement: number }[];
};

export type Marker = {
  label: string;
  code: string;
  screened_grants: number;
  screened_disbursement: number;
  by_score: Record<string, { n_grants: number; disbursement: number }>;
  principal_top_sectors: { sector: string; disbursement: number }[];
  principal_top_donors: { name: string; slug: string; disbursement: number }[];
};

export type SDG = { goal: number; disbursement: number; n_grants: number };

export type Channel = { channel: string; disbursement: number; n_grants: number };

export type Flow = { flow: string; disbursement: number; n_grants: number };

export type DonorProfile = {
  name: string;
  slug: string;
  donor_country: string | null;
  n_grants: number;
  disbursement: number;
  commitment: number;
  by_year: { year: number; disbursement: number }[];
  by_country: { country: string; disbursement: number }[];
  by_region: { region: string; disbursement: number }[];
  by_sector: { sector: string; disbursement: number }[];
  flow_split: { flow: string; disbursement: number }[];
  sample_grants: {
    year: number | null;
    country: string | null;
    sector: string | null;
    title: string | null;
    description: string | null;
    disbursement: number;
  }[];
};

export type DonorXCountry = {
  donors: string[];
  countries: string[];
  cells: { donor: string; country: string; disbursement: number }[];
};

export type JudgeAnswer =
  | { id: string; question: string; answer_type: "donor_list"; unit: string;
      answer: { name: string; slug: string; disbursement: number }[] }
  | { id: string; question: string; answer_type: "country_list"; unit: string;
      answer: { country: string; disbursement: number }[] }
  | { id: string; question: string; answer_type: "timeseries"; unit: string;
      answer: { year: number; disbursement: number }[] };

export type ExplorerRow = {
  y: string | null;       // year (string; "2020-2023" sentinel possible)
  dc: string | null;      // donor country
  rm: string | null;      // recipient region macro
  s: string | null;       // sector
  v: number;              // disbursement USD mn
  n: number;              // number of grants
};

export type LegendEntry = { variable: string; description: string };

export const loadSummary = () => readJson<Summary>("summary.json");
export const loadTopDonors = () => readJson<DonorRow[]>("top-donors.json");
export const loadDonorCountries = () => readJson<DonorCountryRow[]>("top-donor-countries.json");
export const loadRecipientCountries = () => readJson<CountryRow[]>("top-recipient-countries.json");
export const loadSectors = () => readJson<SectorRow[]>("sectors.json");
export const loadSubsectors = () => readJson<Subsector[]>("subsectors.json");
export const loadTimeseries = () => readJson<Timeseries>("timeseries-year.json");
export const loadMarkers = () => readJson<Marker[]>("markers.json");
export const loadSDG = () => readJson<SDG[]>("sdg.json");
export const loadChannels = () => readJson<Channel[]>("channels.json");
export const loadFlows = () => readJson<Flow[]>("flow-types.json");
export const loadDonorXCountry = () => readJson<DonorXCountry>("donor-x-country.json");
export const loadJudgeQuestions = () => readJson<JudgeAnswer[]>("judge-questions.json");
export const loadExplorer = () => readJson<{ rows: ExplorerRow[] }>("explorer-aggregates.json");
export const loadLegend = () => readJson<LegendEntry[]>("legend.json");

export async function loadDonorProfile(slug: string): Promise<DonorProfile | null> {
  try {
    return await readJson<DonorProfile>(`donors/${slug}.json`);
  } catch {
    return null;
  }
}

export async function listDonorSlugs(): Promise<string[]> {
  const dir = path.join(DATA_DIR, "donors");
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}
