import { Suspense } from "react";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/page";
import { MapLoading } from "./map-loading";
import { MapView } from "./map-view";
import { ParcelPanel } from "./parcel-panel";
import { ParcelSheet } from "./parcel-sheet";

type Params = Promise<Record<string, string | string[] | undefined>>;

const param = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);

async function Sheet({ params }: { params: Params }) {
  const selected = param((await params).parcel);
  return selected ? <ParcelSheet id={selected} /> : null;
}

async function Side({ params }: { params: Params }) {
  const sp = await params;
  const selected = param(sp.parcel);
  if (!selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted">
        <Icon name="map" size={40} />
        <p className="mt-3 text-lg font-semibold">Select a parcel on the map</p>
        <p className="mt-1">Or search by parcel ID or farmer name.</p>
      </div>
    );
  }
  return (
    <Suspense key={selected} fallback={<Skeleton rows={4} />}>
      <ParcelPanel id={selected} tab={param(sp.tab) ?? "environment"} layer={param(sp.layer) ?? "crops"} />
    </Suspense>
  );
}

export function MapScreen({ params }: { params: Params }) {
  return (
    <>
      <div className="relative min-w-0 flex-1">
        <Suspense fallback={<MapLoading />}>
          <MapView />
        </Suspense>
        <Suspense fallback={null}>
          <Sheet params={params} />
        </Suspense>
      </div>
      <aside className="hidden w-[460px] shrink-0 overflow-y-auto border-l-[1.5px] border-line bg-surface px-6 py-7 lg:block">
        <Suspense fallback={<Skeleton rows={4} />}>
          <Side params={params} />
        </Suspense>
      </aside>
    </>
  );
}
