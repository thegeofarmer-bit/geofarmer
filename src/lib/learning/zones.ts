import { bestClustering, distance, standardize } from "./kmeans";

export const ZONE_FEATURES = [
  { key: "mean_slope", label: "slope", unit: "°", high: "steeper", low: "gentle" },
  { key: "mean_elevation", label: "elevation", unit: "m", high: "upland", low: "lowland" },
  { key: "soil_sand", label: "sand", unit: "%", high: "sandy", low: "less sandy" },
  { key: "soil_ph_relative", label: "pH (relative)", unit: "/100", high: "higher pH", low: "more acidic" },
  { key: "soil_organic_carbon_relative", label: "carbon (relative)", unit: "/100", high: "high carbon", low: "low carbon" },
  { key: "soil_nitrogen_relative", label: "nitrogen (relative)", unit: "/100", high: "high nitrogen", low: "low nitrogen" },
] as const;

const ZONE_COLORS = ["#4E79A7", "#F28E2B", "#59A14F", "#B07AA1", "#EDC948", "#76B7B2"];

interface Zone {
  id: number;
  letter: string;
  name: string;
  color: string;
  size: number;
  traits: string[];
  profile: Record<string, number>;
}

export interface ZoneModel {
  zones: Zone[];
  assignment: Record<string, number>;
  vectors: Record<string, number[]>;
  silhouette: number;
}

export interface Neighbour {
  parcelId: string;
  similarity: number;
  sameZone: boolean;
}

export function buildZoneModel(values: Record<string, Record<string, number>>): ZoneModel | null {
  const ids = Object.keys(values[ZONE_FEATURES[0].key] ?? {}).filter((pid) =>
    ZONE_FEATURES.every((f) => Number.isFinite(values[f.key]?.[pid])),
  );
  if (ids.length < 10) return null;

  const raw = ids.map((pid) => ZONE_FEATURES.map((f) => values[f.key][pid]));
  const { rows } = standardize(raw);
  const clustering = bestClustering(rows);

  const order = clustering.centroids
    .map((_, i) => ({ i, size: clustering.labels.filter((l) => l === i).length }))
    .sort((a, b) => b.size - a.size);
  const rank = new Map(order.map((o, r) => [o.i, r]));

  const zones: Zone[] = order.map(({ i, size }, r) => {
    const centroid = clustering.centroids[i];
    const traits = ZONE_FEATURES.map((f, j) => ({ f, z: centroid[j] }))
      .filter((t) => Math.abs(t.z) >= 0.4)
      .sort((a, b) => Math.abs(b.z) - Math.abs(a.z))
      .slice(0, 3)
      .map((t) => (t.z > 0 ? t.f.high : t.f.low));
    const members = raw.filter((_, row) => clustering.labels[row] === i);
    const profile = Object.fromEntries(
      ZONE_FEATURES.map((f, j) => [f.key, Number((members.reduce((s, m) => s + m[j], 0) / members.length).toFixed(1))]),
    );
    const letter = String.fromCharCode(65 + r);
    const label = traits.length ? traits.slice(0, 2).join(", ") : "typical of the area";
    return { id: r, letter, name: `Zone ${letter}: ${label}`, color: ZONE_COLORS[r % ZONE_COLORS.length], size, traits, profile };
  });

  return {
    zones,
    assignment: Object.fromEntries(ids.map((pid, row) => [pid, rank.get(clustering.labels[row])!])),
    vectors: Object.fromEntries(ids.map((pid, row) => [pid, rows[row].map((x) => Number(x.toFixed(4)))])),
    silhouette: Number(clustering.silhouette.toFixed(3)),
  };
}

export function similarParcels(model: ZoneModel, parcelId: string, n = 5): Neighbour[] {
  const target = model.vectors[parcelId];
  if (!target) return [];
  const all = Object.entries(model.vectors)
    .filter(([pid]) => pid !== parcelId)
    .map(([pid, v]) => ({ pid, d: distance(target, v) }));
  const max = Math.max(...all.map((x) => x.d)) || 1;
  return all
    .sort((a, b) => a.d - b.d || a.pid.localeCompare(b.pid))
    .slice(0, n)
    .map(({ pid, d }) => ({
      parcelId: pid,
      similarity: Math.round(100 * (1 - d / max)),
      sameZone: model.assignment[pid] === model.assignment[parcelId],
    }));
}
