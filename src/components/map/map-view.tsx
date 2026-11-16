"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { BasemapToggle, useBasemap } from "./basemap";
import { LayerChips } from "./layer-chips";
import { MapCanvas } from "./map-canvas";
import { MapLegend } from "./map-legend";
import { MapSearch } from "./map-search";
import { CROP_LAYER } from "./types";
import { useMapData, webglSupported } from "./use-map-data";
import { useMapParams } from "./use-map-params";
import { useMapTheme } from "./use-map-theme";

const noop = () => () => {};

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-2 p-8 text-center">
      <Icon name="map" size={36} className="text-muted" />
      <p className="text-lg font-bold">{title}</p>
      <p className="max-w-sm text-muted">{body}</p>
      <Link href="/crops" className="rounded-full bg-brand px-5 py-2.5 font-bold text-brand-ink">
        Browse parcels as a list
      </Link>
    </div>
  );
}

export function MapView({ selected, layer }: { selected: string | null; layer: string }) {
  const theme = useMapTheme();
  const go = useMapParams();
  const { data, error } = useMapData();
  const [basemap, setBasemap] = useBasemap();
  const webgl = useSyncExternalStore(noop, webglSupported, () => true);

  if (!webgl) return <Notice title="This phone can't draw the map" body="Its browser has no WebGL support. Every parcel is still available as a list." />;
  if (error) return <Notice title="The map didn't load" body="Check your connection and reopen the map, or browse the parcels as a list." />;
  if (!theme || !data) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-2" aria-busy="true">
        <p className="flex items-center gap-2 font-semibold text-muted">
          <Icon name="map" size={22} className="animate-pulse" /> Loading the map…
        </p>
      </div>
    );
  }

  const active = data.layers.find((l) => l.key === layer);
  return (
    <div className="relative h-full w-full">
      <MapCanvas parcels={data.parcels} layer={active} selected={selected} theme={theme} basemap={basemap} onSelect={(id) => go({ parcel: id })} />
      <div className="pointer-events-none absolute inset-x-0 top-0 space-y-3 p-4">
        <MapSearch parcels={data.parcels} onSelect={(id) => go({ parcel: id })} />
        <LayerChips layers={data.layers} active={layer} onChange={(key) => go({ layer: key === CROP_LAYER ? null : key })} />
      </div>
      <MapLegend layer={active} items={data.legend} />
      <BasemapToggle value={basemap} onChange={setBasemap} />
    </div>
  );
}
