import { describe, expect, it } from "vitest";
import type { Crop, CropSeason } from "../types";
import { adviseRotation } from "./rotation";
import { assessCrop, rangeScore, rankCrops } from "./suitability";

const crop = (o: Partial<Crop> & Pick<Crop, "crop_id" | "crop_name" | "crop_family">): Crop => ({
  crop_duration_days: 100,
  optimal_temp_min_c: 20,
  optimal_temp_max_c: 30,
  optimal_ph_min: 5.5,
  optimal_ph_max: 7,
  water_requirement: "Moderate",
  drought_tolerance: "Low",
  nitrogen_fixing: false,
  nutrient_demand: "Moderate",
  ...o,
});

const maize = crop({ crop_id: "C001", crop_name: "Maize", crop_family: "Poaceae", nutrient_demand: "High" });
const rice = crop({ crop_id: "C003", crop_name: "Rice", crop_family: "Poaceae", water_requirement: "High", nutrient_demand: "High" });
const cowpea = crop({
  crop_id: "C002", crop_name: "Cowpea", crop_family: "Fabaceae", nitrogen_fixing: true,
  water_requirement: "Low", drought_tolerance: "High", nutrient_demand: "Low",
});
const cassava = crop({
  crop_id: "C005", crop_name: "Cassava", crop_family: "Euphorbiaceae", crop_duration_days: 365,
  water_requirement: "Low", drought_tolerance: "High", nutrient_demand: "High",
});

const season = (crop_id: string, planting_date: string): CropSeason => ({
  season_id: `S-${crop_id}-${planting_date}`, parcel_id: "P001", crop_id, season_name: "Major",
  season_year: Number(planting_date.slice(0, 4)), planting_date, expected_harvest_date: null,
  actual_harvest_date: null, crop_variety: null, crop_status: "Harvested", planting_method: "Rows",
  is_simulated: true, created_at: planting_date, outcome: null, yield_kg_per_ha: null, outcome_note: null,
});

describe("rangeScore", () => {
  it("is 1 inside the range and falls off linearly", () => {
    expect(rangeScore(6, 5.5, 7, 1)).toBe(1);
    expect(rangeScore(5, 5.5, 7, 1)).toBeCloseTo(0.5);
    expect(rangeScore(3, 5.5, 7, 1)).toBe(0);
  });
});

describe("assessCrop", () => {
  it("never invents missing values: lists them and scores only what is present", () => {
    const r = assessCrop(maize, { mean_slope: 2, soil_sand: 40 });
    expect(r.missing.map((m) => m.key)).toEqual(["temperature", "ph", "rainfall", "nitrogen"]);
    expect(r.factors).toHaveLength(2);
    expect(r.score).toBe(100);
    expect(r.coverage).toBeCloseTo(0.25);
  });

  it("returns 0 with zero coverage when nothing is known", () => {
    const r = assessCrop(maize, {});
    expect(r.score).toBe(0);
    expect(r.coverage).toBe(0);
    expect(r.factors).toHaveLength(0);
  });

  it("explains a pH outside the crop range", () => {
    const r = assessCrop(maize, { soil_ph: 4.8 });
    expect(r.factors[0].tone).not.toBe("good");
    expect(r.factors[0].detail).toContain("more acidic");
  });

  it("warns low-drought-tolerance crops near their rainfall need", () => {
    const r = assessCrop(maize, { annual_rainfall_mm: 1000 });
    expect(r.factors[0].tone).toBe("warn");
    expect(r.factors[0].detail).toContain("steady water");
  });

  it("penalises thirsty crops on sandy soil and steep paddy", () => {
    const ranked = rankCrops([rice, cowpea], { soil_sand: 75, mean_slope: 6 });
    expect(ranked[0].crop.crop_name).toBe("Cowpea");
    expect(ranked[1].score).toBeLessThan(50);
  });
});

describe("adviseRotation", () => {
  const crops = [maize, rice, cowpea, cassava];

  it("recommends a nitrogen-fixing legume after a cereal and avoids repeating it", () => {
    const a = adviseRotation([season("C001", "2026-04-01")], crops);
    expect(a.lastCrop?.crop_name).toBe("Maize");
    expect(a.recommended?.crop.crop_name).toBe("Cowpea");
    expect(a.recommended?.reasons.map((r) => r.lead)).toContain("It fixes nitrogen.");
    const avoid = a.avoid.map((o) => o.crop.crop_name);
    expect(avoid).toContain("Maize");
    expect(avoid).toContain("Rice");
  });

  it("uses the latest season regardless of input order", () => {
    const a = adviseRotation([season("C001", "2025-04-01"), season("C002", "2026-04-01")], crops);
    expect(a.lastCrop?.crop_name).toBe("Cowpea");
  });

  it("gives no recommendation without history", () => {
    const a = adviseRotation([], crops);
    expect(a.lastCrop).toBeNull();
    expect(a.recommended).toBeNull();
  });
});

describe("fit label", () => {
  it("says Limited data instead of a fit when under half the factors are known", () => {
    expect(assessCrop(maize, { mean_slope: 2, soil_sand: 40 }).fit).toBe("Limited data");
    expect(
      assessCrop(maize, { mean_slope: 2, soil_sand: 40, soil_ph: 6, mean_temp_c: 25, annual_rainfall_mm: 1400 }).fit,
    ).toBe("High fit");
  });
});
