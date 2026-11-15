import type { MultiPolygon } from "geojson";

export type Level = "Low" | "Moderate" | "High";

export interface Crop {
  crop_id: string;
  crop_name: string;
  crop_family: string;
  crop_duration_days: number;
  optimal_temp_min_c: number;
  optimal_temp_max_c: number;
  optimal_ph_min: number;
  optimal_ph_max: number;
  water_requirement: Level;
  drought_tolerance: Level;
  nitrogen_fixing: boolean;
  nutrient_demand: Level;
}

export interface ParcelOverview {
  parcel_id: string;
  farmer_id: string | null;
  farmer_name: string | null;
  community: string | null;
  farm_area_ha: number | null;
  is_simulated: boolean;
  has_geometry: boolean;
  geometry: MultiPolygon | null;
  centroid_lon: number | null;
  centroid_lat: number | null;
  latest_season_id: string | null;
  latest_crop_id: string | null;
  latest_crop_name: string | null;
  latest_crop_status: string | null;
  latest_planting_date: string | null;
}

export interface Dataset {
  dataset_id: string;
  name: string;
  source: string;
  is_simulated: boolean;
  period_start: string | null;
  period_end: string | null;
  resolution_m: number | null;
  units: string | null;
  notes: string | null;
}

export interface EnvValue {
  parcel_id: string;
  variable: string;
  value: number;
  unit: string | null;
  dataset_id: string;
  method: string | null;
}

export interface CropSeason {
  season_id: string;
  parcel_id: string;
  crop_id: string;
  season_name: "Major" | "Minor";
  season_year: number;
  planting_date: string;
  expected_harvest_date: string | null;
  actual_harvest_date: string | null;
  crop_variety: string | null;
  crop_status: "Planned" | "Growing" | "Harvested" | "Failed";
  planting_method: "Rows" | "Broadcast" | "Mounds" | "Ridges" | null;
  outcome: "Poor" | "Fair" | "Good" | null;
  yield_kg_per_ha: number | null;
  outcome_note: string | null;
  is_simulated: boolean;
  created_at: string;
}

export interface Farmer {
  farmer_id: string;
  farmer_name: string;
  community: string | null;
  preferred_crops: string | null;
  is_simulated: boolean;
}

export interface MoistureClass {
  parcel_id: string;
  moisture_class: number;
  class_percent: number;
}
