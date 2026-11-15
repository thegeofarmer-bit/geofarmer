import type { Crop, Level } from "../types";

type FactorKey = "temperature" | "ph" | "rainfall" | "texture" | "slope" | "nitrogen";
type Tone = "good" | "warn" | "bad";

interface FactorResult {
  key: FactorKey;
  label: string;
  score: number;
  weight: number;
  tone: Tone;
  lead: string;
  detail: string;
}

interface MissingFactor {
  key: FactorKey;
  label: string;
  variable: string;
}

export interface SuitabilityResult {
  crop: Crop;
  score: number;
  fit: "High fit" | "Moderate fit" | "Low fit" | "Limited data";
  factors: FactorResult[];
  missing: MissingFactor[];
  coverage: number;
  baseScore?: number;
  learned?: { delta: number; harvests: number; onParcel: number; onSimilar: number };
}

export type EnvInput = Partial<Record<
  "mean_temp_c" | "soil_ph" | "annual_rainfall_mm" | "soil_sand" | "mean_slope" | "soil_nitrogen",
  number
>>;

const FACTORS: { key: FactorKey; label: string; variable: keyof EnvInput; weight: number }[] = [
  { key: "temperature", label: "temperature", variable: "mean_temp_c", weight: 20 },
  { key: "ph", label: "soil pH", variable: "soil_ph", weight: 20 },
  { key: "rainfall", label: "rainfall", variable: "annual_rainfall_mm", weight: 25 },
  { key: "texture", label: "soil texture", variable: "soil_sand", weight: 15 },
  { key: "slope", label: "slope", variable: "mean_slope", weight: 10 },
  { key: "nitrogen", label: "soil nitrogen", variable: "soil_nitrogen", weight: 10 },
];

const TOTAL_WEIGHT = FACTORS.reduce((s, f) => s + f.weight, 0);

const RAIN_NEED: Record<Level, number> = { Low: 600, Moderate: 900, High: 1300 };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const tone = (s: number): Tone => (s >= 0.8 ? "good" : s >= 0.5 ? "warn" : "bad");
const fmt = (n: number, d = 1) => n.toLocaleString("en-GB", { maximumFractionDigits: d, minimumFractionDigits: d });

export function rangeScore(value: number, min: number, max: number, margin: number): number {
  if (value >= min && value <= max) return 1;
  const dist = value < min ? min - value : value - max;
  return clamp01(1 - dist / margin);
}

function temperature(crop: Crop, t: number): Omit<FactorResult, "weight" | "key" | "label"> {
  const s = rangeScore(t, crop.optimal_temp_min_c, crop.optimal_temp_max_c, 5);
  const range = `${fmt(crop.optimal_temp_min_c, 0)} to ${fmt(crop.optimal_temp_max_c, 0)} °C`;
  return {
    score: s,
    tone: tone(s),
    lead: `Temperature ${fmt(t)} °C`,
    detail: s === 1 ? `is inside the ${range} range.` : `is outside the ${range} range ${crop.crop_name.toLowerCase()} likes.`,
  };
}

function ph(crop: Crop, v: number): Omit<FactorResult, "weight" | "key" | "label"> {
  const s = rangeScore(v, crop.optimal_ph_min, crop.optimal_ph_max, 1);
  const range = `${fmt(crop.optimal_ph_min)} to ${fmt(crop.optimal_ph_max)}`;
  return {
    score: s,
    tone: tone(s),
    lead: `Soil pH ${fmt(v)}`,
    detail:
      s === 1
        ? `is inside the ${range} range ${crop.crop_name.toLowerCase()} likes.`
        : `is ${v < crop.optimal_ph_min ? "more acidic" : "more alkaline"} than the ${range} range ${crop.crop_name.toLowerCase()} likes.`,
  };
}

function rainfall(crop: Crop, mm: number): Omit<FactorResult, "weight" | "key" | "label"> {
  const need = RAIN_NEED[crop.water_requirement];
  const s = mm >= need ? 1 : clamp01((mm - need * 0.5) / (need * 0.5));
  const lead = `Rainfall ${Math.round(mm).toLocaleString("en-GB")} mm`;
  if (s === 1 && crop.drought_tolerance === "Low" && mm < need * 1.25) {
    return {
      score: 0.85,
      tone: "warn",
      lead,
      detail: `is enough, but ${crop.crop_name.toLowerCase()} needs steady water. Drought tolerance: low.`,
    };
  }
  return {
    score: s,
    tone: tone(s),
    lead,
    detail:
      s === 1
        ? `covers the ${crop.water_requirement.toLowerCase()} water need (about ${need.toLocaleString("en-GB")} mm).`
        : `is below the ${crop.water_requirement.toLowerCase()} water need (about ${need.toLocaleString("en-GB")} mm).`,
  };
}

function texture(crop: Crop, sand: number): Omit<FactorResult, "weight" | "key" | "label"> {
  const thirsty = crop.water_requirement;
  let s: number;
  if (sand > 70) s = { High: 0.3, Moderate: 0.7, Low: 1 }[thirsty];
  else if (sand >= 50) s = { High: 0.6, Moderate: 0.9, Low: 1 }[thirsty];
  else s = 1;
  const lead = `Soil ${fmt(sand, 0)}% sand`;
  const detail =
    sand >= 50
      ? s >= 1
        ? `suits ${crop.crop_name.toLowerCase()}, which copes with light, fast-draining soil.`
        : `drains fast and holds little water; ${crop.crop_name.toLowerCase()} has a ${thirsty.toLowerCase()} water need.`
      : "holds water well for most crops.";
  return { score: s, tone: tone(s), lead, detail };
}

function slope(crop: Crop, deg: number): Omit<FactorResult, "weight" | "key" | "label"> {
  const paddy = crop.water_requirement === "High";
  const s = paddy ? (deg <= 2 ? 1 : clamp01(1 - (deg - 2) / 6)) : deg <= 5 ? 1 : clamp01(1 - (deg - 5) / 15);
  return {
    score: s,
    tone: tone(s),
    lead: `Slope ${fmt(deg)}°`,
    detail:
      s === 1
        ? "is gentle, with low erosion risk."
        : paddy
          ? "is too steep to hold standing water well."
          : "raises erosion risk; consider contour ridges.",
  };
}

function nitrogen(crop: Crop, n: number): Omit<FactorResult, "weight" | "key" | "label"> {
  const lead = `Soil nitrogen ${fmt(n, 2)} g/kg`;
  if (crop.nitrogen_fixing) {
    return { score: 1, tone: "good", lead, detail: `does not limit ${crop.crop_name.toLowerCase()}, which fixes its own nitrogen.` };
  }
  const need = { High: 1.5, Moderate: 1.0, Low: 0.5 }[crop.nutrient_demand];
  const s = n >= need ? 1 : clamp01(0.3 + (0.7 * n) / need);
  return {
    score: s,
    tone: tone(s),
    lead,
    detail: s === 1 ? `meets the ${crop.nutrient_demand.toLowerCase()} nutrient demand.` : `is low for a ${crop.nutrient_demand.toLowerCase()} nutrient demand; fertiliser may be needed.`,
  };
}

const EVAL = { temperature, ph, rainfall, texture, slope, nitrogen } as const;

export function fitFor(score: number, coverage: number): SuitabilityResult["fit"] {
  return coverage < 0.5 ? "Limited data" : score >= 75 ? "High fit" : score >= 55 ? "Moderate fit" : "Low fit";
}

export function assessCrop(crop: Crop, env: EnvInput): SuitabilityResult {
  const factors: FactorResult[] = [];
  const missing: MissingFactor[] = [];
  for (const f of FACTORS) {
    const v = env[f.variable];
    if (v === undefined || v === null || Number.isNaN(v)) {
      missing.push({ key: f.key, label: f.label, variable: f.variable });
      continue;
    }
    factors.push({ key: f.key, label: f.label, weight: f.weight, ...EVAL[f.key](crop, v) });
  }
  const w = factors.reduce((s, f) => s + f.weight, 0);
  const score = w === 0 ? 0 : Math.round((100 * factors.reduce((s, f) => s + f.weight * f.score, 0)) / w);
  const coverage = w / TOTAL_WEIGHT;
  return {
    crop,
    score,
    fit: fitFor(score, coverage),
    factors: factors.sort((a, b) => b.score - a.score || b.weight - a.weight),
    missing,
    coverage,
  };
}

export function rankCrops(crops: Crop[], env: EnvInput): SuitabilityResult[] {
  return crops
    .map((c) => assessCrop(c, env))
    .sort((a, b) => b.score - a.score || a.crop.crop_name.localeCompare(b.crop.crop_name));
}

export const FACTOR_COUNT = FACTORS.length;
