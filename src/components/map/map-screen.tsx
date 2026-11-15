import { Suspense } from "react";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/page";
import { MapView } from "./map-view";
import { ParcelPanel } from "./parcel-panel";
import { ParcelSheet } from "./parcel-sheet";

export function MapScreen({ selected, layer, tab }: { selected: string | null; layer: string; tab: string }) {
  return (
    <>
      <div className="relative min-w-0 flex-1">
        <MapView selected={selected} layer={layer} />
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
