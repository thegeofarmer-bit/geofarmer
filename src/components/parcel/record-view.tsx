import { notFound } from "next/navigation";
import { RecordSeasonForm } from "@/components/forms/record-season-form";
import { PageHeader } from "@/components/ui/page";
import { getCrops, getParcel } from "@/lib/data";

export async function RecordView({ id, crop }: { id: string; crop?: string }) {
  const [parcel, crops] = await Promise.all([getParcel(id), getCrops()]);
  if (!parcel) notFound();
  return (
    <>
      <PageHeader back={`/parcel/${id}`} kicker={`Parcel ${id} · New season`} title="Record planting" />
      <RecordSeasonForm parcelId={id} crops={crops} defaultCrop={crop} />
    </>
  );
}
