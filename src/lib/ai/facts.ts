import type { ParcelAnalysis } from "../analysis";
import { FACTOR_COUNT } from "../engine/suitability";
import { relativeLevel, VARIABLES } from "../variables";

export interface AdviceFacts {
  parcel: { id: string; area_ha: number | null; farmer: string | null; data_note: string };
  observed: { name: string; value: number; unit: string; source: string }[];
  relative: { name: string; level: string; position_0_to_100: number }[];
  missing: string[];
  land_zone: { name: string; parcels_in_zone: number; learned_from: string } | null;
  similar_parcels: string[];
  crops: string[];
  suitability: {
    factors_used: string;
    top: { crop: string; score: number; fit: string; reasons: string[]; soil_signal?: string; learned?: string }[];
  };
  rotation: {
    last_crop: string;
    recommended: { crop: string; reasons: string[] };
    also_possible: string[];
    avoid: string[];
  } | null;
}

const round = (n: number, d: number) => Number(n.toFixed(d));

export function buildFacts(a: ParcelAnalysis): AdviceFacts {
  const observed: AdviceFacts["observed"] = [];
  const relative: AdviceFacts["relative"] = [];
  const missing: string[] = [];

  for (const def of VARIABLES) {
    const v = a.values[def.key];
    const rel = def.relativeKey ? a.values[def.relativeKey] : undefined;
    if (v) {
      const ds = a.datasetById[v.dataset_id];
      observed.push({
        name: def.label.toLowerCase(),
        value: round(Number(v.value), def.digits),
        unit: def.unit,
        source: ds ? `${ds.source}${ds.resolution_m ? `, ${ds.resolution_m} m` : ""}` : v.dataset_id,
      });
    } else if (rel) {
      const pos = Math.round(Number(rel.value));
      relative.push({ name: def.label.toLowerCase(), level: relativeLevel(pos), position_0_to_100: pos });
    } else {
      missing.push(def.label.toLowerCase());
    }
  }

  const top = a.suitability.slice(0, 3).map((r) => ({
    crop: r.crop.crop_name,
    score: r.score,
    fit: r.fit,
    reasons: r.factors.map((f) => `${f.lead} ${f.detail}`),
    ...(r.soilSignal ? { soil_signal: `${r.soilSignal.delta > 0 ? "+" : ""}${r.soilSignal.delta}: ${r.soilSignal.reason}` } : {}),
    ...(r.learned && r.learned.delta !== 0
      ? { learned: `${r.learned.delta > 0 ? "+" : ""}${r.learned.delta} from ${r.learned.harvests} recorded harvests (rules alone ${r.baseScore})` }
      : {}),
  }));
  const used = a.suitability[0]?.factors.length ?? 0;
  const rot = a.rotation;

  return {
    parcel: {
      id: a.parcel.parcel_id,
      area_ha: a.parcel.farm_area_ha == null ? null : round(Number(a.parcel.farm_area_ha), 1),
      farmer: a.parcel.farmer_name,
      data_note: "Parcel boundary and farmer are simulated demo records.",
    },
    observed,
    relative,
    missing,
    land_zone: a.zone
      ? { name: a.zone.name, parcels_in_zone: a.zone.size, learned_from: "k-means clustering of terrain and soil data" }
      : null,
    similar_parcels: a.neighbours.map((n) => n.parcelId),
    crops: a.crops.map((c) => c.crop_name),
    suitability: { factors_used: `${used} of ${FACTOR_COUNT}`, top },
    rotation:
      rot.lastCrop && rot.recommended
        ? {
            last_crop: rot.lastCrop.crop_name,
            recommended: {
              crop: rot.recommended.crop.crop_name,
              reasons: rot.recommended.reasons.map((r) => `${r.ok ? "+" : "-"} ${r.lead} ${r.detail}`),
            },
            also_possible: rot.alternatives.map((o) => o.crop.crop_name),
            avoid: rot.avoid.map((o) => o.crop.crop_name),
          }
        : null,
  };
}

export function expectedCrop(facts: AdviceFacts): string | null {
  return facts.rotation?.recommended.crop ?? facts.suitability.top[0]?.crop ?? null;
}
