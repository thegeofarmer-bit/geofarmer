import { NotAvailableBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";
import type { MoistureClass } from "@/lib/types";
import { MOISTURE_NOTE } from "@/lib/variables";

export function MoistureRow({ moisture }: { moisture: MoistureClass[] }) {
  const dominant = [...moisture].sort((x, y) => y.class_percent - x.class_percent)[0];
  return (
    <li className="flex gap-4 py-5">
      <Icon name="drop" size={28} className="mt-0.5 shrink-0 text-brand" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">Moisture class</h3>
          {dominant ? (
            <p className="font-mono text-2xl font-bold">
              {dominant.moisture_class}
              <span className="ml-1 text-sm font-medium text-muted">{Math.round(dominant.class_percent)}% of parcel</span>
            </p>
          ) : (
            <NotAvailableBadge />
          )}
        </div>
        {moisture.length > 0 && (
          <div className="mt-2 flex h-3 overflow-hidden rounded-full border-[1.5px] border-line-strong" aria-hidden="true">
            {moisture
              .filter((m) => m.class_percent > 0)
              .map((m) => (
                <div
                  key={m.moisture_class}
                  title={`Class ${m.moisture_class}: ${Math.round(m.class_percent)}%`}
                  style={{
                    width: `${m.class_percent}%`,
                    background: `color-mix(in srgb, var(--info-line) ${15 + m.moisture_class * 17}%, var(--surface-2))`,
                  }}
                />
              ))}
          </div>
        )}
        <p className="mt-2 text-[15px] text-muted">{MOISTURE_NOTE}</p>
      </div>
    </li>
  );
}
