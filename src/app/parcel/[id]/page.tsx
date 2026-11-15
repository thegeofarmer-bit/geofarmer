import { Suspense } from "react";
import { ParcelDetail } from "@/components/parcel/parcel-detail";
import { Page, Skeleton } from "@/components/ui/page";

export default function ParcelPage({ params, searchParams }: PageProps<"/parcel/[id]">) {
  return (
    <Page>
      <Suspense fallback={<Skeleton rows={5} />}>
        {Promise.all([params, searchParams]).then(([{ id }, sp]) => (
          <ParcelDetail id={id} saved={Boolean(sp.saved)} />
        ))}
      </Suspense>
    </Page>
  );
}
