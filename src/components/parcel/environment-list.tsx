import type { ParcelAnalysis } from "@/lib/analysis";
import { VARIABLES } from "@/lib/variables";
import { EnvironmentRow } from "./environment-row";
import { MoistureRow } from "./moisture-row";

export function EnvironmentList({ a }: { a: ParcelAnalysis }) {
  return (
    <ul className="card divide-y-[1.5px] divide-line px-5">
      {VARIABLES.map((def) => {
        const value = a.values[def.key];
        return (
          <EnvironmentRow
            key={def.key}
            def={def}
            value={value}
            dataset={value ? a.datasetById[value.dataset_id] : undefined}
            relative={def.relativeKey ? a.values[def.relativeKey] : undefined}
          />
        );
      })}
      <MoistureRow moisture={a.moisture} />
    </ul>
  );
}
