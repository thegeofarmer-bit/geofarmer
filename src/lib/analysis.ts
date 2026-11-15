import "server-only";
import { getAllSeasons, getCrops, getDatasets, getEnvironment, getMoisture, getParcel, getSeasons } from "./data";
import { adviseRotation } from "./engine/rotation";
import { rankCrops, type EnvInput } from "./engine/suitability";
import { getZoneModel } from "./learning/model";
import { applyLearning, learnAdjustments } from "./learning/outcomes";
import { similarParcels } from "./learning/zones";
import type { EnvValue } from "./types";

export async function getParcelAnalysis(parcelId: string) {
  const [parcel, env, crops, datasets, seasons, moisture, allSeasons, zoneModel] = await Promise.all([
    getParcel(parcelId),
    getEnvironment(parcelId),
    getCrops(),
    getDatasets(),
    getSeasons(parcelId),
    getMoisture(parcelId),
    getAllSeasons(),
    getZoneModel(),
  ]);
  if (!parcel) return null;

  const values: Record<string, EnvValue> = Object.fromEntries(env.map((e) => [e.variable, e]));
  const input: EnvInput = {};
  for (const key of ["mean_temp_c", "soil_ph", "annual_rainfall_mm", "soil_sand", "mean_slope", "soil_nitrogen"] as const) {
    if (values[key]) input[key] = Number(values[key].value);
  }

  const neighbours = zoneModel ? similarParcels(zoneModel, parcelId) : [];
  const zone = zoneModel && parcelId in zoneModel.assignment ? zoneModel.zones[zoneModel.assignment[parcelId]] : null;
  const learned = learnAdjustments(parcelId, allSeasons, neighbours);
  const suitability = applyLearning(rankCrops(crops, input), learned);
  const rotation = adviseRotation(seasons, crops, suitability);
  const datasetById = Object.fromEntries(datasets.map((d) => [d.dataset_id, d]));
  const cropById = Object.fromEntries(crops.map((c) => [c.crop_id, c]));

  return {
    parcel,
    values,
    suitability,
    rotation,
    seasons,
    moisture,
    crops,
    cropById,
    datasetById,
    zone,
    neighbours,
  };
}

export type ParcelAnalysis = NonNullable<Awaited<ReturnType<typeof getParcelAnalysis>>>;
