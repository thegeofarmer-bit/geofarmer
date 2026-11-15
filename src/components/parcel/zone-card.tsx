import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { ParcelAnalysis } from "@/lib/analysis";
import { ZONE_FEATURES } from "@/lib/learning/zones";

export function ZoneCard({ a }: { a: ParcelAnalysis }) {
  if (!a.zone) return null;
  const z = a.zone;
  return (
    <section className="card p-5" aria-label="Land zone">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted uppercase">
            <Icon name="layers" size={18} /> Land zone · learned from the data
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-extrabold">
            <span className="h-4 w-4 rounded border-[1.5px] border-ink" style={{ background: z.color }} />
            {z.name}
          </h2>
          <p className="text-muted">
            {z.size} parcels share this profile. Grouped by k-means on NASA SRTM terrain, SoilGrids sand and the relative
            soil maps.
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {ZONE_FEATURES.map((f) => (
          <div key={f.key}>
            <dt className="text-xs font-semibold text-muted">Zone avg {f.label}</dt>
            <dd className="font-mono font-bold">
              {z.profile[f.key]}
              <span className="ml-0.5 text-xs font-medium text-muted">{f.unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      {a.neighbours.length > 0 && (
        <div className="mt-5 border-t-[1.5px] border-line pt-4">
          <p className="text-sm font-bold tracking-wide text-muted uppercase">Most similar parcels</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {a.neighbours.map((n) => (
              <li key={n.parcelId}>
                <Link
                  href={`/parcel/${n.parcelId}`}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-line-strong px-3 py-1.5 font-semibold hover:bg-surface-2"
                >
                  <span className="font-mono">{n.parcelId}</span>
                  <span className="text-muted">{n.similarity}% similar</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Harvest results recorded on these parcels also adjust this parcel&apos;s crop scores.
          </p>
        </div>
      )}
    </section>
  );
}
