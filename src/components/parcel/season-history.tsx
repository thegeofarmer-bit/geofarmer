import Link from "next/link";
import { SeasonStatusForm } from "@/components/forms/season-status-form";
import { Icon } from "@/components/ui/icon";
import { cropColor } from "@/lib/crops";
import { formatDate } from "@/lib/format";
import type { Crop, CropSeason } from "@/lib/types";

function SeasonItem({ season: s, crop }: { season: CropSeason; crop?: Crop }) {
  return (
    <li className="card p-5">
      <div className="flex items-start gap-4">
        <span className="mt-1 h-10 w-2 shrink-0 rounded-full" style={{ background: cropColor(crop?.crop_name) }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg font-bold">
              {crop?.crop_name ?? s.crop_id} · {s.season_name} {s.season_year}
            </p>
            <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-bold">{s.crop_status}</span>
          </div>
          <p className="text-muted">
            Planted {formatDate(s.planting_date)}
            {s.planting_method ? ` · ${s.planting_method}` : ""} · expected harvest {formatDate(s.expected_harvest_date)}
            {s.actual_harvest_date ? ` · harvested ${formatDate(s.actual_harvest_date)}` : ""}
          </p>
          {s.outcome && (
            <p className="mt-1 text-sm font-semibold">
              Outcome: {s.outcome}
              {s.yield_kg_per_ha != null ? ` · ${s.yield_kg_per_ha} kg/ha` : ""}
              {s.outcome_note ? ` · ${s.outcome_note}` : ""}
            </p>
          )}
        </div>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer font-semibold text-brand">Update status, harvest or outcome</summary>
        <SeasonStatusForm season={s} />
      </details>
    </li>
  );
}

export function SeasonHistory({
  parcelId,
  seasons,
  cropById,
}: {
  parcelId: string;
  seasons: CropSeason[];
  cropById: Record<string, Crop>;
}) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Crop history</h2>
        <Link
          href={`/parcel/${parcelId}/record`}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 font-bold text-brand-ink"
        >
          <Icon name="plus" size={20} /> Record planting
        </Link>
      </div>
      {seasons.length === 0 ? (
        <p className="card p-5 text-muted">No seasons recorded yet.</p>
      ) : (
        <ol className="space-y-3">
          {seasons.map((s) => (
            <SeasonItem key={s.season_id} season={s} crop={cropById[s.crop_id]} />
          ))}
        </ol>
      )}
    </section>
  );
}
