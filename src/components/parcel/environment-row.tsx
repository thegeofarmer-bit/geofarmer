import { NotAvailableBadge, ObservedBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";
import type { Dataset, EnvValue } from "@/lib/types";
import { formatValue, type VariableDef } from "@/lib/variables";
import { RangeBar } from "./range-bar";
import { RelativeDetail, RelativeHeadline } from "./relative-value";

function sourceLine(ds: Dataset | undefined) {
  if (!ds) return null;
  const res = ds.resolution_m ? `, ${ds.resolution_m} m` : "";
  return `${ds.source.replace(/ via .*/, "")}${res}`;
}

export function EnvironmentRow({
  def,
  value,
  dataset,
  relative,
}: {
  def: VariableDef;
  value?: EnvValue;
  dataset?: Dataset;
  relative?: EnvValue;
}) {
  const rel = !value && relative ? Number(relative.value) : null;
  return (
    <li className="flex gap-4 py-5">
      <Icon name={def.icon} size={28} className="mt-0.5 shrink-0 text-brand" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">{def.label}</h3>
          {value ? (
            <p className="font-mono text-2xl font-bold">
              {formatValue(Number(value.value), def)}
              {def.unit && <span className="ml-1 text-sm font-medium text-muted">{def.unit}</span>}
            </p>
          ) : rel !== null ? (
            <RelativeHeadline value={rel} />
          ) : (
            <NotAvailableBadge />
          )}
        </div>
        {value ? (
          <>
            {def.scale && <RangeBar value={Number(value.value)} scale={def.scale} />}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <ObservedBadge />
              <span className="text-[15px] text-muted">{sourceLine(dataset)}</span>
            </div>
            {def.key === "soil_sand" && (
              <p className="mt-2 text-[15px] text-muted">Silt and clay not supplied yet, so the texture class is unknown.</p>
            )}
          </>
        ) : rel !== null ? (
          <RelativeDetail value={rel} />
        ) : (
          <p className="mt-1 text-[15px] text-muted">Not estimated. Scores use the other factors.</p>
        )}
      </div>
    </li>
  );
}
