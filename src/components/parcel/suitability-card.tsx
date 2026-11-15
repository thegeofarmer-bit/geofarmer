import { Icon } from "@/components/ui/icon";
import { cropColor } from "@/lib/crops";
import { FACTOR_COUNT, type SuitabilityResult } from "@/lib/engine/suitability";

type Tone = SuitabilityResult["factors"][number]["tone"];

const TONE_ICON = { good: "check", warn: "alert", bad: "x" } as const;
const TONE_TEXT = { good: "text-brand", warn: "text-warn-ink", bad: "text-bad" } as const;

function FactorLine({ tone, lead, detail }: { tone: Tone; lead: string; detail: string }) {
  return (
    <li className="flex gap-3">
      <Icon name={TONE_ICON[tone]} size={22} className={`mt-0.5 shrink-0 ${TONE_TEXT[tone]}`} />
      <p className={`text-[16px] leading-snug ${TONE_TEXT[tone]}`}>
        <b>{lead}</b> {detail}
      </p>
    </li>
  );
}

export function SuitabilityCard({ result: r, rank, open }: { result: SuitabilityResult; rank: number; open: boolean }) {
  const top = rank === 1;
  const fitIcon = r.fit === "Low fit" ? "x" : r.fit === "Limited data" ? "info" : "check";
  return (
    <li className={`card p-5 ${top ? "border-2 border-brand" : ""}`}>
      <details open={open}>
        <summary className="flex cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-brand text-xl font-bold ${
              top ? "bg-brand text-brand-ink" : "bg-brand-soft text-brand"
            }`}
          >
            {rank}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="flex items-center gap-2 text-2xl font-extrabold">
                <span className="h-3.5 w-3.5 rounded-sm border border-ink/40" style={{ background: cropColor(r.crop.crop_name) }} />
                {r.crop.crop_name}
              </h3>
              <p className="font-bold">
                <span className="text-4xl">{r.score}</span>
                <span className="text-muted"> /100</span>
              </p>
            </div>
            <p className="flex items-center gap-1.5 font-semibold">
              <Icon name={fitIcon} size={18} />
              {r.fit}
              {r.coverage < 0.5 && (
                <span className="font-normal text-muted">
                  · based on {r.factors.length} of {FACTOR_COUNT} factors
                </span>
              )}
            </p>
            {r.soilSignal && (
              <p className={`mt-1 text-sm font-semibold ${r.soilSignal.delta > 0 ? "text-brand" : "text-warn-ink"}`}>
                {r.soilSignal.delta > 0 ? "+" : ""}
                {r.soilSignal.delta} · {r.soilSignal.reason}
              </p>
            )}
            {r.learned && r.learned.delta !== 0 && (
              <p className={`mt-1 text-sm font-semibold ${r.learned.delta > 0 ? "text-brand" : "text-bad"}`}>
                Learned {r.learned.delta > 0 ? "+" : ""}
                {r.learned.delta} from {r.learned.harvests} recorded harvest{r.learned.harvests === 1 ? "" : "s"}
                {r.learned.onSimilar > 0 ? ` (${r.learned.onSimilar} on similar parcels)` : ""} · rules alone: {r.baseScore}
              </p>
            )}
            <div className="mt-2 h-3 overflow-hidden rounded-full border-[1.5px] border-line-strong bg-surface-2">
              <div className="h-full bg-brand" style={{ width: `${r.score}%` }} />
            </div>
          </div>
        </summary>
        <ul className="mt-4 space-y-3 border-t-[1.5px] border-line pt-4">
          {r.factors.map((f) => (
            <FactorLine key={f.key} tone={f.tone} lead={f.lead} detail={f.detail} />
          ))}
          <li className="text-sm text-muted">
            {r.crop.crop_family} · {r.crop.crop_duration_days} days · water need {r.crop.water_requirement.toLowerCase()} ·
            drought tolerance {r.crop.drought_tolerance.toLowerCase()}
          </li>
        </ul>
      </details>
    </li>
  );
}
