import { Icon } from "@/components/ui/icon";
import type { Dataset } from "@/lib/types";

function status(d: Dataset) {
  if (d.is_simulated) return { label: "Simulated", icon: "flask", tone: "text-warn-ink" } as const;
  if (d.notes?.startsWith("RELATIVE")) return { label: "Relative only", icon: "layers", tone: "text-info-ink" } as const;
  if (d.notes?.startsWith("NOT YET")) return { label: "Not yet available", icon: "dash", tone: "text-info-ink" } as const;
  return { label: "Observed", icon: "signal", tone: "text-info-ink" } as const;
}

export function DataSources({ datasets }: { datasets: Dataset[] }) {
  return (
    <section className="card p-6">
      <h2 className="text-2xl font-extrabold">Data sources</h2>
      <ul className="mt-4 space-y-3">
        {datasets.map((d) => {
          const s = status(d);
          return (
            <li key={d.dataset_id} className="flex items-start gap-3">
              <Icon name={s.icon} size={20} className={`mt-0.5 shrink-0 ${s.tone}`} />
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-muted">
                  {s.label} · {d.source}
                  {d.resolution_m ? ` · ${d.resolution_m} m` : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
