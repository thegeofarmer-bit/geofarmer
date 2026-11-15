import { Suspense } from "react";
import { RecordView } from "@/components/parcel/record-view";
import { Page, Skeleton } from "@/components/ui/page";

export default function RecordPage({ params, searchParams }: PageProps<"/parcel/[id]/record">) {
  return (
    <Page>
      <Suspense fallback={<Skeleton rows={4} />}>
        {Promise.all([params, searchParams]).then(([{ id }, sp]) => (
          <RecordView id={id} crop={typeof sp.crop === "string" ? sp.crop : undefined} />
        ))}
      </Suspense>
    </Page>
  );
}
