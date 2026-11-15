import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdvisorCard, AdvisorSkeleton } from "@/components/assistant/advisor-card";
import { PageHeader } from "@/components/ui/page";
import { getParcelAnalysis } from "@/lib/analysis";
import { formatHectares } from "@/lib/format";
import { MissingBanner } from "./missing-banner";
import { SuitabilityList } from "./suitability-list";

export async function CropsView({ id }: { id: string }) {
  const a = await getParcelAnalysis(id);
  if (!a) notFound();
  const area = formatHectares(a.parcel.farm_area_ha);
  return (
    <>
      <PageHeader back={`/parcel/${id}`} kicker={`Parcel ${id}${area ? ` · ${area}` : ""}`} title="Best crops here" />
      <div className="space-y-5">
        <Suspense fallback={<AdvisorSkeleton />}>
          <AdvisorCard parcelId={id} />
        </Suspense>
        <MissingBanner result={a.suitability[0]} />
        <SuitabilityList a={a} />
        <p className="pb-4 text-sm text-muted">
          Scores compare this parcel with each crop&apos;s needs in the crop reference table. They are decision support, not
          yield predictions. Slope and sand thresholds are GeoFarmer defaults pending agronomy review.
        </p>
      </div>
    </>
  );
}
