import { Suspense } from "react";
import { Dashboard } from "@/components/home/dashboard";
import { SimulatedBadge } from "@/components/ui/badges";
import { Page, PageHeader, Skeleton } from "@/components/ui/page";

export default function HomePage() {
  return (
    <Page wide>
      <PageHeader kicker="Ejura-Sekyedumase" title="Your farms" />
      <SimulatedBadge label="Prototype farm records" className="mb-6 w-full justify-center py-2 text-base sm:w-auto" />
      <Suspense fallback={<Skeleton rows={4} />}>
        <Dashboard />
      </Suspense>
    </Page>
  );
}
