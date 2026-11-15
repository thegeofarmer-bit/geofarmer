import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page";
import { getParcelAnalysis } from "@/lib/analysis";
import { RotationCard } from "./rotation-card";

export async function RotationView({ id }: { id: string }) {
  const a = await getParcelAnalysis(id);
  if (!a) notFound();
  return (
    <>
      <PageHeader back={`/parcel/${id}`} kicker={`Parcel ${id}`} title="What to plant next" />
      <RotationCard a={a} />
    </>
  );
}
