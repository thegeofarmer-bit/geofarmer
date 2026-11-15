"use client";

import { LayerChips } from "./layer-chips";
import { MapCanvas } from "./map-canvas";
import { MapLegend } from "./map-legend";
import { MapSearch } from "./map-search";
import { CROP_LAYER, type LegendItem, type MapLayerOption, type MapParcel } from "./types";
import { useMapParams } from "./use-map-params";
import { useMapTheme } from "./use-map-theme";

export function MapView({
  parcels,
  layers,
  selected,
  layer,
  legend,
}: {
  parcels: MapParcel[];
  layers: MapLayerOption[];
  selected: string | null;
  layer: string;
  legend: LegendItem[];
}) {
  const theme = useMapTheme();
  const go = useMapParams();
  const active = layers.find((l) => l.key === layer);

  if (!theme) return <div className="h-full w-full bg-surface-2" />;

  return (
    <div className="relative h-full w-full">
      <MapCanvas
        parcels={parcels}
        layer={active}
        selected={selected}
        showLetters={layer === CROP_LAYER}
        theme={theme}
        onSelect={(id) => go({ parcel: id })}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 space-y-3 p-4">
        <MapSearch parcels={parcels} onSelect={(id) => go({ parcel: id })} />
        <LayerChips layers={layers} active={layer} onChange={(key) => go({ layer: key === CROP_LAYER ? null : key })} />
      </div>
      <MapLegend layer={active} items={legend} />
    </div>
  );
}
