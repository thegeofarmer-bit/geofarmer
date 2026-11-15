import type { Crop, CropSeason } from "../types";
import type { SuitabilityResult } from "./suitability";

interface RotationReason {
  ok: boolean;
  lead: string;
  detail: string;
}

interface RotationOption {
  crop: Crop;
  points: number;
  reasons: RotationReason[];
}

export interface RotationAdvice {
  lastCrop: Crop | null;
  recommended: RotationOption | null;
  alternatives: RotationOption[];
  avoid: RotationOption[];
}

const lower = (s: string) => s.toLowerCase();
const isCereal = (c: Crop) => c.crop_family === "Poaceae";

export function adviseRotation(
  history: CropSeason[],
  crops: Crop[],
  suitability: SuitabilityResult[] = [],
): RotationAdvice {
  const byId = new Map(crops.map((c) => [c.crop_id, c]));
  const ordered = [...history].sort((a, b) => b.planting_date.localeCompare(a.planting_date));
  const last = ordered[0] ? (byId.get(ordered[0].crop_id) ?? null) : null;
  const recent = new Set(ordered.slice(1, 3).map((s) => s.crop_id));
  const suit = new Map(suitability.map((s) => [s.crop.crop_id, s]));

  const options: RotationOption[] = crops.map((crop) => {
    const reasons: RotationReason[] = [];
    let points = 0;

    if (last) {
      if (crop.crop_id === last.crop_id) {
        points -= 40;
        reasons.push({
          ok: false,
          lead: `Avoid ${lower(last.crop_name)} again.`,
          detail: "Growing the same crop back to back builds up pests and disease.",
        });
      } else if (crop.crop_family === last.crop_family) {
        points -= 25;
        reasons.push({
          ok: false,
          lead: `Same family as ${lower(last.crop_name)}.`,
          detail: `Both are ${crop.crop_family}, so they share pests and draw on the same nutrients.`,
        });
      } else if (isCereal(last) && crop.crop_family === "Fabaceae") {
        points += 10;
        reasons.push({
          ok: true,
          lead: "It follows a cereal.",
          detail: `${last.crop_name} was the last crop. A legume breaks the cycle.`,
        });
      } else {
        points += 5;
        reasons.push({
          ok: true,
          lead: "It changes crop family.",
          detail: `${crop.crop_family} after ${last.crop_family} helps break pest cycles.`,
        });
      }

      if (crop.nitrogen_fixing && !last.nitrogen_fixing) {
        points += last.nutrient_demand === "High" ? 25 : 15;
        reasons.push({
          ok: true,
          lead: "It fixes nitrogen.",
          detail:
            last.nutrient_demand === "High"
              ? `${last.crop_name} takes a lot from the soil. ${crop.crop_name} gives some back.`
              : `${crop.crop_name} adds nitrogen for the next crop.`,
        });
      } else if (last.nitrogen_fixing && crop.nutrient_demand === "High") {
        points += 15;
        reasons.push({
          ok: true,
          lead: "It uses the nitrogen left behind.",
          detail: `${last.crop_name} fixed nitrogen that a heavy feeder like ${lower(crop.crop_name)} can use.`,
        });
      } else if (last.nutrient_demand === "High" && crop.nutrient_demand === "High" && crop.crop_id !== last.crop_id) {
        points -= 10;
        reasons.push({
          ok: false,
          lead: "Another heavy feeder.",
          detail: `${crop.crop_name} would follow ${lower(last.crop_name)}, which already drew down soil nutrients.`,
        });
      }
    }

    if (recent.has(crop.crop_id) && crop.crop_id !== last?.crop_id) {
      points -= 10;
      reasons.push({ ok: false, lead: "Grown here recently.", detail: "Leave a longer gap before repeating it." });
    }

    if (crop.crop_duration_days > 200) {
      points -= 5;
      reasons.push({
        ok: false,
        lead: `Takes about ${crop.crop_duration_days} days.`,
        detail: "It occupies the field for more than one season.",
      });
    }

    const s = suit.get(crop.crop_id);
    if (s && s.factors.length > 0) {
      points += s.score * 0.3;
      const water = s.factors.find((f) => f.key === "rainfall");
      if (water) reasons.push({ ok: water.tone !== "bad", lead: `${water.lead}.`, detail: water.detail });
    }

    return { crop, points, reasons };
  });

  const ranked = options.sort((a, b) => b.points - a.points || a.crop.crop_name.localeCompare(b.crop.crop_name));
  const viable = ranked.filter((o) => o.points >= 0);
  return {
    lastCrop: last,
    recommended: last ? (viable[0] ?? ranked[0] ?? null) : null,
    alternatives: last ? viable.slice(1, 3) : [],
    avoid: last ? ranked.filter((o) => o.points < 0) : [],
  };
}
