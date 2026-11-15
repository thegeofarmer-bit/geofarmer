import { Suspense } from "react";
import Link from "next/link";
import { AdvisorCard, AdvisorSkeleton } from "@/components/assistant/advisor-card";
import { notFound } from "next/navigation";
import { AssignFarmerForm } from "@/components/forms/assign-farmer-form";
import { SimulatedBadge } from "@/components/ui/badges";
import { Callout } from "@/components/ui/callout";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page";
import { getParcelAnalysis } from "@/lib/analysis";
import { getFarmers } from "@/lib/data";
import { EnvironmentList } from "./environment-list";
import { ParcelSubtitle } from "./parcel-subtitle";
import { SeasonHistory } from "./season-history";
import { ZoneCard } from "./zone-card";

export async function ParcelDetail({ id, saved }: { id: string; saved: boolean }) {
  const [a, farmers] = await Promise.all([getParcelAnalysis(id), getFarmers()]);
  if (!a) notFound();

  return (
    <>
      <PageHeader
        back="/map"
        kicker="Parcel"
        title={<span className="font-mono">{id}</span>}
        aside={a.parcel.is_simulated && <SimulatedBadge />}
      />
      <div className="-mt-3 mb-6">
        <ParcelSubtitle parcel={a.parcel} />
        {!a.parcel.has_geometry && (
          <p className="mt-2 font-semibold text-warn-ink">
            No boundary has been mapped for this parcel, so it has no environmental values.
          </p>
        )}
      </div>

      {saved && (
        <div className="mb-6">
          <Callout tone="info" icon="check">
            <b>Season saved.</b> It was added to this parcel&apos;s history; earlier seasons are unchanged.
          </Callout>
        </div>
      )}

      <div className="mb-6">
        <Suspense fallback={<AdvisorSkeleton />}>
          <AdvisorCard parcelId={id} />
        </Suspense>
      </div>

      <EnvironmentList a={a} />

      <div className="mt-6">
        <ZoneCard a={a} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href={`/parcel/${id}/crops`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-lg font-bold text-brand-ink"
        >
          <Icon name="sprout" /> Assess crops
        </Link>
        <Link
          href={`/parcel/${id}/rotation`}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-brand py-4 text-lg font-bold text-brand"
        >
          <Icon name="cycle" /> Plant next
        </Link>
      </div>

      <SeasonHistory parcelId={id} seasons={a.seasons} cropById={a.cropById} />

      <section className="mt-10 mb-6">
        <h2 className="mb-3 text-2xl font-extrabold">Farmer</h2>
        <div className="card p-5">
          <AssignFarmerForm parcelId={id} farmers={farmers} current={a.parcel.farmer_id} />
          <p className="mt-3 text-sm text-muted">Farmers are demo identities, not real people.</p>
        </div>
      </section>
    </>
  );
}
