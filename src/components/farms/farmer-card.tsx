import Link from "next/link";
import { FarmerForm } from "@/components/forms/farmer-form";
import { cropColor } from "@/lib/crops";
import { formatHectares } from "@/lib/format";
import type { Farmer, ParcelOverview } from "@/lib/types";

export function FarmerCard({ farmer: f, parcels }: { farmer: Farmer; parcels: ParcelOverview[] }) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">{f.farmer_name}</h3>
          <p className="text-muted">
            {[f.community, f.preferred_crops && `prefers ${f.preferred_crops}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="font-mono text-sm text-muted">{f.farmer_id}</span>
      </div>
      {parcels.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {parcels.map((p) => (
            <li key={p.parcel_id}>
              <Link
                href={`/parcel/${p.parcel_id}`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-line-strong px-3 py-1.5 font-semibold hover:bg-surface-2"
              >
                <span className="h-3 w-3 rounded-sm" style={{ background: cropColor(p.latest_crop_name) }} />
                <span className="font-mono">{p.parcel_id}</span>
                <span className="text-muted">{formatHectares(p.farm_area_ha) ?? "unmapped"}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">No parcels assigned. Assign one from a parcel&apos;s page.</p>
      )}
      <details className="mt-3">
        <summary className="cursor-pointer font-semibold text-brand">Edit farmer</summary>
        <div className="mt-3">
          <FarmerForm farmer={f} />
        </div>
      </details>
    </article>
  );
}
