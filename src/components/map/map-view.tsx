"use client";

import { use, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { BasemapToggle, useBasemap, type Basemap } from "./basemap";
import { LayerChips } from "./layer-chips";
import { MapLoading } from "./map-loading";
import { MapCanvas } from "./map-canvas";
import { setMapFocus, useIsMobile, useMapFocus } from "./map-focus";
import { MapLegend } from "./map-legend";
import { MapSearch } from "./map-search";
import { CROP_LAYER } from "./types";
import { mapData, webglSupported } from "./use-map-data";
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

function FocusBar({ basemap, onBasemap }: { basemap: Basemap; onBasemap: (b: Basemap) => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={() => setMapFocus(false)}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 font-bold text-surface shadow-lg"
      >
        <Icon name="x" size={18} /> Exit full map
      </button>
      <BasemapToggle value={basemap} onChange={onBasemap} />
    </div>
  );
}

export function MapView() {
  const params = useSearchParams();
  const selected = params.get("parcel");
  const layer = params.get("layer") ?? CROP_LAYER;
  const theme = useMapTheme();
  const go = useMapParams();
  const data = typeof window === "undefined" ? undefined : use(mapData());
  const [basemap, setBasemap] = useBasemap();
  const webgl = useSyncExternalStore(noop, webglSupported, () => true);
  const mobile = useIsMobile();
  const focused = useMapFocus() && mobile;

  useEffect(() => () => setMapFocus(false), []);

  if (!webgl) return <Notice title="This phone can't draw the map" body="Its browser has no WebGL support. Every parcel is still available as a list." />;
  if (data === null) return <Notice title="The map didn't load" body="Check your connection and reopen the map, or browse the parcels as a list." />;
  if (!theme || !data) return <MapLoading />;

  const active = data.layers.find((l) => l.key === layer);
  const select = (id: string | null) => {
    setMapFocus(false);
    go({ parcel: id });
  };
  return (
    <div className="relative h-full w-full">
      <MapCanvas
        parcels={data.parcels}
        layer={active}
        selected={selected}
        theme={theme}
        basemap={basemap}
        mobile={mobile}
        onSelect={select}
        onInteract={() => mobile && setMapFocus(true)}
      />
      {focused && <FocusBar basemap={basemap} onBasemap={setBasemap} />}
      <div className={`pointer-events-none absolute inset-x-0 top-0 space-y-3 p-4 ${focused ? "hidden" : ""}`}>
        <MapSearch parcels={data.parcels} onSelect={(id) => go({ parcel: id })} />
        <LayerChips layers={data.layers} active={layer} onChange={(key) => go({ layer: key === CROP_LAYER ? null : key })} />
        <div className="flex items-start gap-3 lg:hidden">
          <MapLegend layer={active} items={data.legend} className="flex-1" />
          <div className="flex flex-col items-end gap-2">
            <BasemapToggle value={basemap} onChange={setBasemap} />
            <button
              type="button"
              onClick={() => setMapFocus(true)}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full border-[1.5px] border-line-strong bg-surface px-3 py-2 text-sm font-bold shadow"
            >
              <Icon name="expand" size={18} /> Full map
            </button>
          </div>
        </div>
      </div>
      <MapLegend layer={active} items={data.legend} className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] max-lg:hidden" />
      <BasemapToggle value={basemap} onChange={setBasemap} className="absolute right-4 bottom-10 max-lg:hidden" />
    </div>
  );
}
