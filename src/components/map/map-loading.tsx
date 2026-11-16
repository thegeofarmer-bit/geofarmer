import { Icon } from "@/components/ui/icon";

export function MapLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-2" aria-busy="true">
      <p className="flex items-center gap-2 font-semibold text-muted">
        <Icon name="map" size={22} className="animate-pulse" /> Loading the map…
      </p>
    </div>
  );
}
