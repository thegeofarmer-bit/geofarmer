import type { Metadata } from "next";
import { MapScreen } from "@/components/map/map-screen";

export const metadata: Metadata = { title: "Map" };

export default function MapPage({ searchParams }: PageProps<"/map">) {
  return (
    <div className="flex h-[calc(100dvh-7rem)] lg:h-dvh">
      <MapScreen params={searchParams} />
    </div>
  );
}
