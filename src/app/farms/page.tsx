import { Suspense } from "react";
import type { Metadata } from "next";
import { FarmsView } from "@/components/farms/farms-view";
import { SimulatedBadge } from "@/components/ui/badges";
import { Page, PageHeader, Skeleton } from "@/components/ui/page";

export const metadata: Metadata = { title: "Farms" };

export default function FarmsPage() {
  return (
    <Page wide>
      <PageHeader kicker="Farm and crop management" title="Farms" aside={<SimulatedBadge label="Demo identities" />} />
      <Suspense fallback={<Skeleton rows={4} />}>
        <FarmsView />
      </Suspense>
    </Page>
  );
}
