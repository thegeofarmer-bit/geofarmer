import { Suspense } from "react";
import type { Metadata } from "next";
import { MapScreen } from "@/components/map/map-screen";

export const metadata: Metadata = { title: "Map" };

const param = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);

export default function MapPage({ searchParams }: PageProps<"/map">) {
  return (
    <div className="flex h-[calc(100dvh-7rem)] lg:h-dvh">
      <Suspense fallback={<div className="flex-1 animate-pulse bg-surface-2" />}>
        {searchParams.then((sp) => (
          <MapScreen
            selected={param(sp.parcel)}
            layer={param(sp.layer) ?? "crops"}
            tab={param(sp.tab) ?? "environment"}
          />
        ))}
      </Suspense>
    </div>
  );
}
