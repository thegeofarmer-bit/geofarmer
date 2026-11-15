import { describe, expect, it } from "vitest";
import type { AdviceFacts } from "./facts";
import { rulesAdvice } from "./fallback";
import { foreignCrops, groundingIssues, strayNumbers } from "./grounding";

const facts: AdviceFacts = {
  parcel: { id: "P001", area_ha: 160, farmer: "Demo Farmer Two", data_note: "Simulated." },
  observed: [{ name: "slope", value: 2.5, unit: "°", source: "NASA SRTM" }],
  relative: [{ name: "soil ph", level: "Medium", position_0_to_100: 56 }],
  missing: ["rainfall", "temperature"],
  land_zone: { name: "Zone B: high carbon", parcels_in_zone: 77, learned_from: "k-means" },
  similar_parcels: ["P005"],
  crops: ["Maize", "Cowpea", "Rice"],
  suitability: { factors_used: "2 of 6", top: [{ crop: "Cowpea", score: 100, fit: "Limited data", reasons: [] }] },
  rotation: {
    last_crop: "Maize",
    recommended: { crop: "Cowpea", reasons: ["+ It fixes nitrogen. Maize takes a lot from the soil."] },
    also_possible: [],
    avoid: ["Maize", "Rice"],
  },
};

const good = {
  recommended_crop: "Cowpea",
  headline: "Plant cowpea next.",
  summary: "Slope is 2.5 degrees. Cowpea fixes nitrogen after maize.",
  next_steps: ["Plant cowpea."],
  cautions: ["Rainfall is missing."],
};

describe("grounding", () => {
  it("accepts an answer built from the facts", () => {
    expect(groundingIssues(good, facts)).toEqual([]);
  });

  it("rejects a different crop than the rules chose", () => {
    expect(groundingIssues({ ...good, recommended_crop: "Maize" }, facts)[0]).toContain("Cowpea");
  });

  it("rejects invented numbers, such as a guessed pH or rainfall", () => {
    expect(groundingIssues({ ...good, summary: "Soil pH is 6.2 and rainfall 1,180 mm." }, facts).join()).toMatch(/6\.2/);
    expect(strayNumbers("The parcel is 160 ha with 2.5° slope.", [facts])).toEqual([]);
  });

  it("rejects crops outside the reference table and promises", () => {
    expect(foreignCrops("Try tomatoes or cocoa.", facts.crops)).toEqual(["tomato", "cocoa"]);
    expect(groundingIssues({ ...good, summary: "This will guarantee a big harvest." }, facts)).toContain("promises an outcome");
    expect(groundingIssues({ ...good, summary: "This is not a guarantee of yield." }, facts)).toEqual([]);
    expect(groundingIssues({ ...good, summary: "Results are guaranteed." }, facts)).toContain("promises an outcome");
  });
});

describe("rules fallback", () => {
  it("always passes the grounding check", () => {
    expect(groundingIssues(rulesAdvice(facts), facts)).toEqual([]);
    expect(groundingIssues(rulesAdvice({ ...facts, rotation: null }), { ...facts, rotation: null })).toEqual([]);
  });
});
