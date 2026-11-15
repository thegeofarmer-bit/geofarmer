import { Suspense } from "react";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/page";
import { NO_CROP_COLOR, cropColor } from "@/lib/crops";
import { getParcels, getVariableByParcel } from "@/lib/data";
import { getZoneModel } from "@/lib/learning/model";
import { MAP_LAYERS } from "@/lib/variables";
import { MapView } from "./map-view";
import { ParcelPanel } from "./parcel-panel";
import { ParcelSheet } from "./parcel-sheet";
import type { MapLayerOption, MapParcel } from "./types";

async function layerValues(key: string, relativeKey?: string) {
  const values = await getVariableByParcel(key);
  if (Object.keys(values).length > 0 || !relativeKey) return { values, relative: false };
  return { values: await getVariableByParcel(relativeKey), relative: true };
}

export async function MapScreen({ selected, layer, tab }: { selected: string | null; layer: string; tab: string }) {
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
      geometry: p.geometry!,
      centroid: [p.centroid_lon!, p.centroid_lat!],
    }));
  const layers: MapLayerOption[] = MAP_LAYERS.map((l, i) => {
    const label = l.label === "Soil texture" ? "Sand" : l.label;
    const { values: v, relative } = values[i];
    return {
      key: l.key,
      label: relative ? `${label} (relative)` : label,
      unit: relative ? "relative 0–100" : l.unit,
      ramp: l.ramp!,
      values: v,
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
  const legend = [
    ...grown.map((name) => ({ name, color: cropColor(name) })),
    { name: "No crop recorded", color: NO_CROP_COLOR },
  ];

  return (
    <>
      <div className="relative min-w-0 flex-1">
        <MapView parcels={mapParcels} layers={layers} selected={selected} layer={layer} legend={legend} />
        {selected && (
          <Suspense fallback={null}>
            <ParcelSheet id={selected} />
          </Suspense>
        )}
      </div>
      <aside className="hidden w-[460px] shrink-0 overflow-y-auto border-l-[1.5px] border-line bg-surface px-6 py-7 lg:block">
        {selected ? (
          <Suspense key={selected} fallback={<Skeleton rows={4} />}>
            <ParcelPanel id={selected} tab={tab} layer={layer} />
          </Suspense>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted">
            <Icon name="map" size={40} />
            <p className="mt-3 text-lg font-semibold">Select a parcel on the map</p>
            <p className="mt-1">Or search by parcel ID or farmer name.</p>
          </div>
        )}
      </aside>
    </>
  );
}
