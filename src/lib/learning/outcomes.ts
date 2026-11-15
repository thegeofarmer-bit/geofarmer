import { fitFor, type SuitabilityResult } from "../engine/suitability";
import type { CropSeason } from "../types";
import type { Neighbour } from "./zones";

export const MAX_ADJUSTMENT = 15;
const PRIOR_STRENGTH = 3;
const NEIGHBOUR_WEIGHT = 0.6;

export interface Learned {
  delta: number;
  harvests: number;
  onParcel: number;
  onSimilar: number;
}

function outcomeValue(s: Pick<CropSeason, "outcome" | "crop_status">): number | null {
  if (s.crop_status === "Failed") return -1;
  if (s.outcome === "Good") return 1;
  if (s.outcome === "Fair") return 0;
  if (s.outcome === "Poor") return -1;
  return null;
}

export function learnAdjustments(
  parcelId: string,
  seasons: Pick<CropSeason, "parcel_id" | "crop_id" | "outcome" | "crop_status">[],
  neighbours: Neighbour[],
): Record<string, Learned> {
  const weightOf = new Map<string, number>([[parcelId, 1]]);
  for (const n of neighbours) weightOf.set(n.parcelId, NEIGHBOUR_WEIGHT * (n.similarity / 100));

  const acc = new Map<string, { sum: number; weight: number; onParcel: number; onSimilar: number }>();
  for (const s of seasons) {
    const w = weightOf.get(s.parcel_id);
    const v = outcomeValue(s);
    if (w === undefined || v === null) continue;
    const a = acc.get(s.crop_id) ?? { sum: 0, weight: 0, onParcel: 0, onSimilar: 0 };
    a.sum += w * v;
    a.weight += w;
    if (s.parcel_id === parcelId) a.onParcel++;
    else a.onSimilar++;
    acc.set(s.crop_id, a);
  }

  return Object.fromEntries(
    [...acc].map(([cropId, a]) => [
      cropId,
      {
        delta: Math.round((MAX_ADJUSTMENT * a.sum) / (a.weight + PRIOR_STRENGTH)),
        harvests: a.onParcel + a.onSimilar,
        onParcel: a.onParcel,
        onSimilar: a.onSimilar,
      },
    ]),
  );
}

export function applyLearning(results: SuitabilityResult[], learned: Record<string, Learned>): SuitabilityResult[] {
  return results
    .map((r) => {
      const l = learned[r.crop.crop_id];
      if (!l || r.factors.length === 0) return r;
      const score = Math.max(0, Math.min(100, r.score + l.delta));
      return { ...r, baseScore: r.score, score, fit: fitFor(score, r.coverage), learned: l };
    })
    .sort((a, b) => b.score - a.score || a.crop.crop_name.localeCompare(b.crop.crop_name));
}
