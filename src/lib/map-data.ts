import "server-only";
import type { MultiPolygon } from "geojson";
import type { LegendItem, MapLayerOption, MapParcel } from "@/components/map/types";
import { NO_CROP_COLOR, cropColor } from "./crops";
import { getParcels, getVariableByParcel } from "./data";
import { getZoneModel } from "./learning/model";
import { MAP_LAYERS } from "./variables";

export interface MapData {
  parcels: MapParcel[];
  layers: MapLayerOption[];
  legend: LegendItem[];
}

const round = (n: number) => Math.round(n * 1e5) / 1e5;

function lighten(g: MultiPolygon): MultiPolygon {
  return { type: "MultiPolygon", coordinates: g.coordinates.map((poly) => poly.map((ring) => ring.map(([x, y]) => [round(x!), round(y!)]))) };
}

async function layerValues(key: string, relativeKey?: string) {
  const values = await getVariableByParcel(key);
  if (Object.keys(values).length > 0 || !relativeKey) return { values, relative: false };
  return { values: await getVariableByParcel(relativeKey), relative: true };
}

export async function getMapData(): Promise<MapData> {
  const [parcels, zoneModel, ...values] = await Promise.all([
    getParcels(),
    getZoneModel(),
    ...MAP_LAYERS.map((l) => layerValues(l.key, l.relativeKey)),
  ]);

  const mapParcels: MapParcel[] = parcels
    .filter((p) => p.geometry && p.centroid_lon != null && p.centroid_lat != null)
    .map((p) => ({
      id: p.parcel_id,
      farmer: p.farmer_name,
      crop: p.latest_crop_name,
      color: cropColor(p.latest_crop_name),
      geometry: lighten(p.geometry!),
      centroid: [round(p.centroid_lon!), round(p.centroid_lat!)],
    }));

  const layers: MapLayerOption[] = MAP_LAYERS.map((l, i) => {
    const label = l.label === "Soil texture" ? "Sand" : l.label;
    const { values: v, relative } = values[i];
    const rounded = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, Math.round(x * 10) / 10]));
    return {
      key: l.key,
      label: relative ? `${label} (relative)` : label,
      unit: relative ? "relative 0–100" : l.unit,
      ramp: l.ramp!,
      values: rounded,
    };
  });
  if (zoneModel) {
    layers.unshift({
      key: "zones",
      label: "Land zones",
      unit: "",
      ramp: ["#000", "#000"],
      values: zoneModel.assignment,
      categories: zoneModel.zones.map((z) => ({ value: z.id, label: `${z.name} (${z.size})`, color: z.color })),
    });
  }

  const grown = [...new Set(parcels.map((p) => p.latest_crop_name).filter((c): c is string => Boolean(c)))];
  const legend = [...grown.map((name) => ({ name, color: cropColor(name) })), { name: "No crop recorded", color: NO_CROP_COLOR }];
  return { parcels: mapParcels, layers, legend };
}
