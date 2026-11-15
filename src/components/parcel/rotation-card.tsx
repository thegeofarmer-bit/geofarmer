import Link from "next/link";
import { Callout } from "@/components/ui/callout";
import { Icon } from "@/components/ui/icon";
import type { ParcelAnalysis } from "@/lib/analysis";

const buttonClass = "flex items-center justify-center gap-3 rounded-2xl bg-brand py-5 text-xl font-bold text-brand-ink";

function NoHistory({ a, recordHref }: { a: ParcelAnalysis; recordHref: (cropId?: string) => string }) {
  const top = a.suitability[0];
  const scored = top && top.factors.length > 0;
  return (
    <div className="space-y-4">
      <Callout tone="info" icon="info">
        <b>No crop history yet.</b> Rotation advice needs at least one recorded season on this parcel.
        {scored && (
          <>
            {" "}Based on suitability alone, <b>{top.crop.crop_name}</b> scores highest.
          </>
        )}
      </Callout>
      <Link href={recordHref(top?.crop.crop_id)} className={buttonClass}>
        <Icon name="plus" size={26} /> Record a season
      </Link>
    </div>
  );
}

export function RotationCard({ a }: { a: ParcelAnalysis }) {
  const { rotation } = a;
  const recordHref = (cropId?: string) =>
    `/parcel/${a.parcel.parcel_id}/record${cropId ? `?crop=${cropId}` : ""}`;
  if (!rotation.lastCrop || !rotation.recommended) return <NoHistory a={a} recordHref={recordHref} />;

  const rec = rotation.recommended;
  const lastCropId = rotation.lastCrop.crop_id;
  const repeatWarning = rotation.avoid.find((o) => o.crop.crop_id === lastCropId)?.reasons[0];
  const reasons = [
    ...rec.reasons.filter((r) => r.ok),
    ...(repeatWarning ? [repeatWarning] : []),
    ...rec.reasons.filter((r) => !r.ok),
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border-2 border-brand bg-brand-soft p-6">
        <p className="font-semibold text-muted">Suggested next crop</p>
        <h3 className="mt-1 text-4xl font-extrabold">{rec.crop.crop_name}</h3>
        <ul className="mt-5 space-y-4">
          {reasons.map((r, i) => (
            <li key={i} className="flex gap-3">
              <Icon name={r.ok ? "check" : "x"} size={22} className={`mt-0.5 shrink-0 ${r.ok ? "text-brand" : "text-bad"}`} />
              <p className="text-[16px] leading-snug">
                <b>{r.lead}</b> {r.detail}
              </p>
            </li>
          ))}
        </ul>
        {rotation.alternatives.length > 0 && (
          <p className="mt-5 text-muted">
            Also possible: {rotation.alternatives.map((o) => o.crop.crop_name).join(" or ")}.{" "}
            {rotation.alternatives.map((o) => `${o.crop.crop_name} takes ${o.crop.crop_duration_days} days`).join(", ")}.
          </p>
        )}
        <p className="mt-3 text-sm text-muted">
          Decision support only, not a yield guarantee. Last crop: {rotation.lastCrop.crop_name}.
        </p>
      </div>
      <Link href={recordHref(rec.crop.crop_id)} className={buttonClass}>
        <Icon name="plus" size={26} /> Plan this season
      </Link>
    </div>
  );
}
