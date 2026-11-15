import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdvisorCard, AdvisorSkeleton } from "@/components/assistant/advisor-card";
import { PageHeader } from "@/components/ui/page";
import { getParcelAnalysis } from "@/lib/analysis";
import { RotationCard } from "./rotation-card";

export async function RotationView({ id }: { id: string }) {
  const a = await getParcelAnalysis(id);
  if (!a) notFound();
  return (
    <>
      <PageHeader back={`/parcel/${id}`} kicker={`Parcel ${id}`} title="What to plant next" />
      <div className="space-y-5">
        <RotationCard a={a} />
        <Suspense fallback={<AdvisorSkeleton />}>
          <AdvisorCard parcelId={id} />
        </Suspense>
      </div>
    </>
  );
}
