import type { ParcelAnalysis } from "@/lib/analysis";
import { SuitabilityCard } from "./suitability-card";

export function SuitabilityList({ a }: { a: ParcelAnalysis }) {
  if (a.suitability[0]?.factors.length === 0) {
    return (
      <p className="card p-5 text-muted">
        No environmental values are available for this parcel yet, so crops cannot be scored.
      </p>
    );
  }
  return (
    <ol className="space-y-4">
      {a.suitability.map((r, i) => (
        <SuitabilityCard key={r.crop.crop_id} result={r} rank={i + 1} open={i === 0} />
      ))}
    </ol>
  );
}
