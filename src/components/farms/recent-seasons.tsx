import Link from "next/link";
import { cropColor } from "@/lib/crops";
import { formatDate } from "@/lib/format";
import type { CropSeason } from "@/lib/types";

export function RecentSeasons({ seasons, cropName }: { seasons: CropSeason[]; cropName: Record<string, string> }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-extrabold">Recent seasons</h2>
      {seasons.length === 0 ? (
        <p className="card p-5 text-muted">No seasons recorded yet.</p>
      ) : (
        <ol className="card divide-y-[1.5px] divide-line">
          {seasons.slice(0, 20).map((s) => (
            <li key={s.season_id}>
              <Link href={`/parcel/${s.parcel_id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2">
                <span className="h-8 w-2 rounded-full" style={{ background: cropColor(cropName[s.crop_id]) }} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {cropName[s.crop_id] ?? s.crop_id}{" "}
                    <span className="font-mono font-normal text-muted">· {s.parcel_id}</span>
                  </p>
                  <p className="text-sm text-muted">
                    {s.season_name} {s.season_year} · planted {formatDate(s.planting_date)}
                  </p>
                </div>
                <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-bold">{s.crop_status}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
