import { Suspense } from "react";
import { CropsView } from "@/components/parcel/crops-view";
import { Page, Skeleton } from "@/components/ui/page";

export default function CropsPage({ params }: PageProps<"/parcel/[id]/crops">) {
  return (
    <Page>
      <Suspense fallback={<Skeleton rows={4} />}>{params.then(({ id }) => <CropsView id={id} />)}</Suspense>
    </Page>
  );
}
