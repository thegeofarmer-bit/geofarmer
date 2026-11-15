import { describe, expect, it } from "vitest";
import type { Crop } from "../types";
import { soilSignals } from "../engine/soil-signal";
import { rankCrops } from "../engine/suitability";
import { bestClustering, kmeans, standardize } from "./kmeans";
import { applyLearning, learnAdjustments, MAX_ADJUSTMENT } from "./outcomes";
import { buildZoneModel, similarParcels, ZONE_FEATURES } from "./zones";

const blob = (cx: number, cy: number, n: number, offset: number) =>
  Array.from({ length: n }, (_, i) => [cx + Math.sin(i + offset) * 0.3, cy + Math.cos(i * 1.7 + offset) * 0.3]);

describe("k-means", () => {
  const rows = [...blob(0, 0, 15, 0), ...blob(5, 5, 15, 1), ...blob(0, 6, 15, 2)];

  it("finds well-separated groups and is deterministic", () => {
    const a = kmeans(rows, 3);
    expect(new Set(a.labels.slice(0, 15)).size).toBe(1);
    expect(new Set(a.labels).size).toBe(3);
    expect(kmeans(rows, 3).labels).toEqual(a.labels);
  });

  it("chooses the right number of groups by silhouette", () => {
    expect(bestClustering(rows, [2, 5]).k).toBe(3);
  });

  it("standardizes to mean 0", () => {
    const { rows: z } = standardize([[1, 10], [3, 30]]);
    expect(z[0][0] + z[1][0]).toBeCloseTo(0);
  });
});

describe("zones and similar parcels", () => {
  const values: Record<string, Record<string, number>> = Object.fromEntries(ZONE_FEATURES.map((f) => [f.key, {}]));
  for (let i = 0; i < 30; i++) {
    const hill = i < 15;
    ZONE_FEATURES.forEach((f, j) => {
      values[f.key][`P${String(i).padStart(3, "0")}`] = (hill ? 50 : 10) + ((i * (j + 3)) % 7);
    });
  }
  const model = buildZoneModel(values)!;

  it("assigns every parcel and names zones from their traits", () => {
    expect(Object.keys(model.assignment)).toHaveLength(30);
    expect(model.zones[0].name).toMatch(/^Zone A: /);
  });

  it("returns the most similar parcels first, excluding itself", () => {
    const n = similarParcels(model, "P000", 3);
    expect(n.map((x) => x.parcelId)).not.toContain("P000");
    expect(n.every((x) => Number(x.parcelId.slice(1)) < 15)).toBe(true);
    expect(n[0].similarity).toBeGreaterThanOrEqual(n[2].similarity);
  });
});

describe("learning from outcomes", () => {
  const crop = (id: string, name: string): Crop => ({
    crop_id: id, crop_name: name, crop_family: "F" + id, crop_duration_days: 100, optimal_temp_min_c: 20,
    optimal_temp_max_c: 30, optimal_ph_min: 5.5, optimal_ph_max: 7, water_requirement: "Moderate",
    drought_tolerance: "Low", nitrogen_fixing: false, nutrient_demand: "Moderate",
  });
  const season = (
    parcel_id: string,
    crop_id: string,
    outcome: "Poor" | "Fair" | "Good" | null,
    crop_status: "Harvested" | "Failed" = "Harvested",
  ) => ({ parcel_id, crop_id, outcome, crop_status });

  it("has no effect without outcomes", () => {
    expect(learnAdjustments("P1", [season("P1", "C1", null)], [])).toEqual({});
  });

  it("moves scores with evidence but stays bounded and shrunk for few records", () => {
    const one = learnAdjustments("P1", [season("P1", "C1", "Good")], []).C1;
    expect(one.delta).toBeGreaterThan(0);
    expect(one.delta).toBeLessThan(MAX_ADJUSTMENT / 2);
    const many = learnAdjustments("P1", Array.from({ length: 30 }, () => season("P1", "C1", "Good")), []).C1;
    expect(many.delta).toBeLessThanOrEqual(MAX_ADJUSTMENT);
    expect(many.delta).toBeGreaterThan(one.delta);
  });

  it("weights similar parcels less than the parcel itself and treats failures as poor", () => {
    const near = [{ parcelId: "P2", similarity: 90, sameZone: true }];
    const own = learnAdjustments("P1", [season("P1", "C1", "Poor")], near).C1.delta;
    const other = learnAdjustments("P1", [season("P2", "C1", "Poor")], near).C1.delta;
    expect(own).toBeLessThan(other);
    expect(learnAdjustments("P1", [season("P1", "C1", null, "Failed")], []).C1.delta).toBeLessThan(0);
  });

  it("re-ranks crops and records the base score", () => {
    const crops = [crop("C1", "Alpha"), crop("C2", "Beta")];
    const base = rankCrops(crops, { mean_slope: 2, soil_sand: 75 }).map((r) => ({ ...r, baseScore: r.score }));
    const learned = applyLearning(base, { C2: { delta: 5, harvests: 3, onParcel: 3, onSimilar: 0 } });
    expect(learned[0].crop.crop_name).toBe("Beta");
    expect(learned[0].baseScore).toBe(82);
    expect(learned[0].score).toBe(87);
    const down = applyLearning(base, { C1: { delta: -9, harvests: 3, onParcel: 3, onSimilar: 0 } });
    expect(down.find((r) => r.crop.crop_id === "C1")!.score).toBe(73);
  });
});

describe("relative soil signal", () => {
  const crop = (id: string, fixing: boolean, demand: "Low" | "High"): Crop => ({
    crop_id: id, crop_name: id, crop_family: id, crop_duration_days: 100, optimal_temp_min_c: 20, optimal_temp_max_c: 30,
    optimal_ph_min: 5.5, optimal_ph_max: 7, water_requirement: "Moderate", drought_tolerance: "Low",
    nitrogen_fixing: fixing, nutrient_demand: demand,
  });
  const base = rankCrops([crop("Heavy", false, "High"), crop("Legume", true, "Low")], { mean_slope: 2, soil_sand: 75 });

  it("favours legumes and cautions heavy feeders only when nitrogen is relatively low", () => {
    const low = soilSignals(base, { nitrogen: 20, carbon: 20 });
    expect(low[0].crop.crop_id).toBe("Legume");
    expect(low[0].soilSignal?.delta).toBe(8);
    expect(low.find((r) => r.crop.crop_id === "Heavy")!.soilSignal?.delta).toBe(-5);
    expect(soilSignals(base, { nitrogen: 50, carbon: 50 })).toBe(base);
    expect(soilSignals(base, {})).toBe(base);
  });
});
