import { Suspense } from "react";
import type { Metadata } from "next";
import { Page, PageHeader, Skeleton } from "@/components/ui/page";
import { Picker } from "@/components/picker/parcel-picker-list";

export const metadata: Metadata = { title: "Crop suitability" };

export default function CropsIndex() {
  return (
    <Page>
      <PageHeader kicker="Crop suitability" title="Pick a parcel" />
      <Suspense fallback={<Skeleton rows={3} />}>
        <Picker suffix="crops" />
      </Suspense>
    </Page>
  );
}
