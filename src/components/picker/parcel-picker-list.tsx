import { cropColor } from "@/lib/crops";
import { getParcels } from "@/lib/data";
import { ParcelPicker } from "./parcel-picker";

export async function Picker({ suffix }: { suffix: "crops" | "rotation" }) {
  const parcels = await getParcels();
  return (
    <ParcelPicker
      suffix={suffix}
      parcels={parcels
        .filter((p) => p.has_geometry)
        .map((p) => ({
          id: p.parcel_id,
          farmer: p.farmer_name,
          crop: p.latest_crop_name,
          color: cropColor(p.latest_crop_name),
          area: p.farm_area_ha == null ? null : Number(p.farm_area_ha),
        }))}
    />
  );
}
