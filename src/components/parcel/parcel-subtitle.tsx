import { formatHectares } from "@/lib/format";
import type { ParcelOverview } from "@/lib/types";

export function ParcelSubtitle({ parcel: p }: { parcel: ParcelOverview }) {
  const parts = [
    p.farmer_name ?? "No farmer assigned",
    formatHectares(p.farm_area_ha) ?? "not mapped",
    p.latest_crop_name ? `${p.latest_crop_name}, ${p.latest_crop_status?.toLowerCase()}` : "no crop recorded",
  ];
  return <p className="text-lg text-muted">{parts.join(" · ")}</p>;
}
