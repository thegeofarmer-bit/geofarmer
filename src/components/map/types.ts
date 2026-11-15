import type { MultiPolygon } from "geojson";

export const CROP_LAYER = "crops";

export interface MapParcel {
  id: string;
  farmer: string | null;
  crop: string | null;
  color: string;
  geometry: MultiPolygon;
  centroid: [number, number];
}

export interface MapLayerOption {
  key: string;
  label: string;
  unit: string;
  ramp: [string, string];
  values: Record<string, number>;
  categories?: { value: number; label: string; color: string }[];
}

export interface LegendItem {
  name: string;
  color: string;
}
