import Link from "next/link";
import { ParcelSubtitle } from "@/components/parcel/parcel-subtitle";
import { OpenAssistantButton } from "@/components/assistant/open-assistant";
import { SimulatedBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";
import { getParcel } from "@/lib/data";

export async function ParcelSheet({ id }: { id: string }) {
  const parcel = await getParcel(id);
  if (!parcel) return null;
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[2rem] border-t-[1.5px] border-line bg-surface px-6 pt-3 pb-6 shadow-[0_-8px_24px_rgb(0_0_0/0.08)] lg:hidden">
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line-strong" />
      <div className="flex items-center justify-between gap-3">
        <Link href={`/parcel/${id}`} className="font-mono text-4xl font-bold tracking-tight">
          {id}
        </Link>
        {parcel.is_simulated && <SimulatedBadge />}
      </div>
      <div className="mt-1">
        <ParcelSubtitle parcel={parcel} />
      </div>
      <Link
        href={`/parcel/${id}/crops`}
        className="mt-5 flex items-center justify-center gap-3 rounded-2xl bg-brand py-4 text-xl font-bold text-brand-ink"
      >
        <Icon name="sprout" size={26} /> Assess crops
      </Link>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Link href={`/parcel/${id}`} className="font-semibold text-brand underline">
          Environment and history
        </Link>
        <OpenAssistantButton label="Ask AI" question={`Explain the recommendation for parcel ${id}.`} className="shrink-0" />
      </div>
    </div>
  );
}
