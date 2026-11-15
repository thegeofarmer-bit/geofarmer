import { relativeLevel } from "../variables";
import { fitFor, type SuitabilityResult } from "./suitability";

export function soilSignals(
  results: SuitabilityResult[],
  relative: { nitrogen?: number; carbon?: number },
): SuitabilityResult[] {
  const lowN = relative.nitrogen !== undefined && relativeLevel(relative.nitrogen) === "Low";
  const lowC = relative.carbon !== undefined && relativeLevel(relative.carbon) === "Low";
  if ((!lowN && !lowC) || results[0]?.factors.length === 0) return results;

  return results
    .map((r) => {
      const c = r.crop;
      let delta = 0;
      const why: string[] = [];
      if (lowN && c.nitrogen_fixing) {
        delta += 5;
        why.push("adds nitrogen where it is low");
      } else if (lowN && c.nutrient_demand === "High") {
        delta -= 5;
        why.push("needs a lot of nitrogen, which is low here");
      }
      if (lowC && c.nitrogen_fixing) {
        delta += 3;
        why.push("helps rebuild low organic carbon");
      }
      if (delta === 0) return r;
      const score = Math.max(0, Math.min(100, r.score + delta));
      return {
        ...r,
        score,
        fit: fitFor(score, r.coverage),
        soilSignal: { delta, reason: `Relative soil signal: ${why.join("; ")}.` },
      };
    })
    .sort((a, b) => b.score - a.score || a.crop.crop_name.localeCompare(b.crop.crop_name));
}
