import { Suspense } from "react";
import Link from "next/link";
import { AdvisorCard, AdvisorSkeleton } from "@/components/assistant/advisor-card";
import { EnvironmentList } from "@/components/parcel/environment-list";
import { MissingBanner } from "@/components/parcel/missing-banner";
import { ParcelSubtitle } from "@/components/parcel/parcel-subtitle";
import { RotationCard } from "@/components/parcel/rotation-card";
import { SuitabilityList } from "@/components/parcel/suitability-list";
import { SimulatedBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";
import { getParcelAnalysis } from "@/lib/analysis";

const TABS = [
  { key: "environment", label: "Environment" },
  { key: "crops", label: "Crops" },
  { key: "rotation", label: "Rotation" },
] as const;

export async function ParcelPanel({ id, tab, layer }: { id: string; tab: string; layer: string }) {
  const a = await getParcelAnalysis(id);
  if (!a) return <p className="text-muted">Parcel {id} was not found.</p>;
  const tabHref = (t: string) => `/map?parcel=${id}&tab=${t}${layer !== "crops" ? `&layer=${layer}` : ""}`;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-mono text-4xl font-bold tracking-tight">{id}</h2>
          {a.parcel.is_simulated && <SimulatedBadge label="Simulated" />}
        </div>
        <ParcelSubtitle parcel={a.parcel} />
      </div>
      <nav className="grid grid-cols-3 overflow-hidden rounded-2xl border-2 border-line-strong" aria-label="Parcel sections">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            scroll={false}
            replace
            aria-current={tab === t.key ? "page" : undefined}
            className={`py-3 text-center text-lg font-semibold ${tab === t.key ? "bg-brand text-brand-ink" : "bg-surface"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {tab === "crops" ? (
        <>
          <MissingBanner result={a.suitability[0]} />
          <SuitabilityList a={a} />
        </>
      ) : tab === "rotation" ? (
        <RotationCard a={a} />
      ) : (
        <>
          <Suspense fallback={<AdvisorSkeleton />}>
            <AdvisorCard parcelId={id} />
          </Suspense>
          <EnvironmentList a={a} />
          <Link
            href={tabHref("crops")}
            scroll={false}
            replace
            className="flex items-center justify-center gap-3 rounded-2xl bg-brand py-4 text-xl font-bold text-brand-ink"
          >
            <Icon name="sprout" size={26} /> Assess crops
          </Link>
          <Link href={`/parcel/${id}`} className="block text-center font-semibold text-brand underline">
            Crop history and record a season
          </Link>
        </>
      )}
    </div>
  );
}
