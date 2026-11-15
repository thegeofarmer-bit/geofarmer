import { Suspense } from "react";
import type { Metadata } from "next";
import { Page, PageHeader, Skeleton } from "@/components/ui/page";
import { Picker } from "@/components/picker/parcel-picker-list";

export const metadata: Metadata = { title: "Crop rotation" };

export default function RotateIndex() {
  return (
    <Page>
      <PageHeader kicker="Crop rotation" title="Pick a parcel" />
      <Suspense fallback={<Skeleton rows={3} />}>
        <Picker suffix="rotation" />
      </Suspense>
    </Page>
  );
}
