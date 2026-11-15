import "server-only";
import { getParcelAnalysis } from "../analysis";
import { getCrops, getDatasets, getParcels } from "../data";
import { buildFacts, type AdviceFacts } from "./facts";

const METHOD = {
  suitability:
    "Each crop gets a 0-1 score per factor against its Crop_Reference needs: temperature (weight 20), soil pH (20), " +
    "rainfall (25), soil sand (15), slope (10), soil nitrogen (10). Missing factors are skipped, never guessed. " +
    "Score = weighted average of available factors x 100. Under half the weight available = 'Limited data'.",
  rotation:
    "From the last recorded crop: same crop -40 points, same family -25, legume after cereal +10, other family +5, " +
    "nitrogen fixer after a heavy feeder +25 (else +15), heavy feeder after legume +15, heavy after heavy -10, " +
    "grown in the 2 seasons before -10, over 200 days -5, plus 30% of the suitability score. Highest wins.",
  learning:
    "GeoFarmer learns in two ways. 1) Land zones: k-means clustering groups parcels with similar slope, elevation, " +
    "sand and relative soil levels; the number of zones is chosen by silhouette score. 2) Outcomes: when a season is " +
    "marked Poor, Fair, Good or Failed, that crop's score is adjusted on that parcel and on its most similar parcels " +
    "(bounded, and small until several harvests are recorded). The rules remain the starting point.",
  data_rules:
    "Farm parcels and farmers are simulated demo records. Elevation and slope come from NASA SRTM. Sand comes from " +
    "ISRIC SoilGrids. Soil pH, organic carbon and nitrogen are relative levels only (rendered maps). Rainfall, " +
    "temperature and NDVI are not available yet. Results are decision support, not yield predictions.",
};

export interface AssistantContext {
  method: typeof METHOD;
  project: {
    area: string;
    mapped_parcels: number;
    parcels_with_crop_records: number;
    crop_reference: {
      crop: string;
      family: string;
      days: number;
      temp_c: string;
      ph: string;
      water_need: string;
      drought_tolerance: string;
      fixes_nitrogen: boolean;
      nutrient_demand: string;
    }[];
    data_sources: { name: string; source: string; status: string }[];
  };
  parcel: AdviceFacts | null;
}

export async function buildContext(parcelId: string | null): Promise<AssistantContext> {
  const [parcels, crops, datasets, analysis] = await Promise.all([
    getParcels(),
    getCrops(),
    getDatasets(),
    parcelId ? getParcelAnalysis(parcelId) : Promise.resolve(null),
  ]);
  return {
    method: METHOD,
    project: {
      area: "Ejura-Sekyedumase Municipality, Ashanti Region, Ghana",
      mapped_parcels: parcels.filter((p) => p.has_geometry).length,
      parcels_with_crop_records: parcels.filter((p) => p.latest_crop_name).length,
      crop_reference: crops.map((c) => ({
        crop: c.crop_name,
        family: c.crop_family,
        days: c.crop_duration_days,
        temp_c: `${c.optimal_temp_min_c}-${c.optimal_temp_max_c}`,
        ph: `${c.optimal_ph_min}-${c.optimal_ph_max}`,
        water_need: c.water_requirement,
        drought_tolerance: c.drought_tolerance,
        fixes_nitrogen: c.nitrogen_fixing,
        nutrient_demand: c.nutrient_demand,
      })),
      data_sources: datasets.map((d) => ({
        name: d.name,
        source: d.source,
        status: d.is_simulated ? "simulated" : d.notes?.startsWith("NOT YET") ? "not available" : d.notes?.startsWith("RELATIVE") ? "relative only" : "observed",
      })),
    },
    parcel: analysis ? buildFacts(analysis) : null,
  };
}
