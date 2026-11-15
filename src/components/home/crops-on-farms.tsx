import Link from "next/link";
import { cropColor, cropLetter } from "@/lib/crops";
import type { ParcelOverview } from "@/lib/types";

export function CropsOnFarms({ parcels }: { parcels: ParcelOverview[] }) {
  const counts = new Map<string, number>();
  for (const p of parcels) {
    if (p.latest_crop_name) counts.set(p.latest_crop_name, (counts.get(p.latest_crop_name) ?? 0) + 1);
  }
  const rows = [...counts].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...counts.values());
  const unrecorded = parcels.length - [...counts.values()].reduce((a, b) => a + b, 0);

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-extrabold">Crops on farms</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-muted">No crops recorded yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {rows.map(([name, n]) => (
            <li key={name} className="grid grid-cols-[2.5rem_7rem_1fr_2.5rem] items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink font-bold">
                {cropLetter(name)}
              </span>
              <span className="text-lg">{name}</span>
              <span className="h-6 overflow-hidden rounded-full border-[1.5px] border-line-strong bg-surface-2">
                <span
                  className="block h-full border-r-2 border-ink"
                  style={{ width: `${(n / max) * 100}%`, background: cropColor(name) }}
                />
              </span>
              <span className="text-right font-mono text-lg font-bold">{n}</span>
            </li>
          ))}
        </ul>
      )}
      {unrecorded > 0 && (
        <p className="mt-4 text-sm text-muted">
          {unrecorded} parcels have no crop recorded yet.{" "}
          <Link href="/map" className="font-semibold text-brand underline">
            Pick one on the map
          </Link>{" "}
          to record a season.
        </p>
      )}
    </section>
  );
}
