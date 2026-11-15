import type { FeatureCollection } from "geojson";
import type { ExpressionSpecification } from "maplibre-gl";
import type { MapLayerOption, MapParcel } from "./types";

export function boundsOf(parcels: MapParcel[]): [number, number, number, number] {
  let [minX, minY, maxX, maxY] = [180, 90, -180, -90];
  for (const p of parcels)
    for (const poly of p.geometry.coordinates)
      for (const [x, y] of poly[0]) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
  return [minX, minY, maxX, maxY];
}

export function toFeatures(parcels: MapParcel[], layer?: MapLayerOption): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: parcels.map((p) => ({
      type: "Feature",
      id: p.id,
      geometry: p.geometry,
      properties: { id: p.id, color: p.color, letter: p.crop ? p.crop[0] : "", value: layer?.values[p.id] ?? null },
    })),
  };
}

export function valueRange(layer?: MapLayerOption) {
  const v = layer ? Object.values(layer.values) : [];
  return v.length ? { min: Math.min(...v), max: Math.max(...v) } : null;
}

export function fillColor(layer?: MapLayerOption): ExpressionSpecification {
  const range = valueRange(layer);
  if (!layer || !range) return ["get", "color"];
  const max = range.max > range.min ? range.max : range.min + 1;
  return [
    "case",
    ["==", ["get", "value"], null],
    "#b9ae9a",
    ["interpolate", ["linear"], ["get", "value"], range.min, layer.ramp[0], max, layer.ramp[1]],
  ];
}
