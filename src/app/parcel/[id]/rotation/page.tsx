import { Suspense } from "react";
import { RotationView } from "@/components/parcel/rotation-view";
import { Page, Skeleton } from "@/components/ui/page";

export default function RotationPage({ params }: PageProps<"/parcel/[id]/rotation">) {
  return (
    <Page>
      <Suspense fallback={<Skeleton rows={2} />}>{params.then(({ id }) => <RotationView id={id} />)}</Suspense>
    </Page>
  );
}
