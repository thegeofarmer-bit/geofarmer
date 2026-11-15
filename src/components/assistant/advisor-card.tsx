import { Icon } from "@/components/ui/icon";
import { getAdvice } from "@/lib/ai/advice";
import { getParcelAnalysis } from "@/lib/analysis";
import { OpenAssistantButton } from "./open-assistant";

export async function AdvisorCard({ parcelId }: { parcelId: string }) {
  const a = await getParcelAnalysis(parcelId);
  if (!a || a.suitability[0]?.factors.length === 0) return null;
  const { advice, source, reason } = await getAdvice(a);
  const ai = source === "ai";

  return (
    <section className="rounded-3xl border-2 border-brand bg-surface p-5 shadow-sm" aria-label="AI summary">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 font-bold text-brand">
          <Icon name="assistant" size={22} />
          {ai ? "AI summary" : "Summary"}
        </p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            ai ? "bg-brand-soft text-brand" : "bg-surface-2 text-muted"
          }`}
        >
          <Icon name={ai ? "shield" : "info"} size={14} />
          {ai ? "Checked against GeoFarmer data" : "Rules only"}
        </span>
      </div>
      <h2 className="mt-3 text-xl leading-snug font-extrabold">{advice.headline}</h2>
      <p className="mt-2 text-[16px] leading-relaxed">{advice.summary}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-bold tracking-wide text-muted uppercase">Next steps</p>
          <ul className="mt-2 space-y-1.5">
            {advice.next_steps.map((s) => (
              <li key={s} className="flex gap-2">
                <Icon name="check" size={18} className="mt-0.5 shrink-0 text-brand" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-muted uppercase">Keep in mind</p>
          <ul className="mt-2 space-y-1.5">
            {advice.cautions.map((c) => (
              <li key={c} className="flex gap-2">
                <Icon name="alert" size={18} className="mt-0.5 shrink-0 text-warn-ink" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={`mt-4 flex flex-wrap items-center gap-3 border-t-[1.5px] border-line pt-3 ${ai ? "justify-end" : "justify-between"}`}>
        {!ai && <p className="text-xs text-muted">{reason} Showing the rules-based summary.</p>}
        <OpenAssistantButton label="Ask about this parcel" question={`Explain the recommendation for parcel ${parcelId}.`} />
      </div>
    </section>
  );
}

export function AdvisorSkeleton() {
  return (
    <div className="rounded-3xl border-2 border-dashed border-brand p-5" aria-busy="true">
      <p className="inline-flex items-center gap-2 font-bold text-brand">
        <Icon name="assistant" size={22} className="animate-pulse" /> AI is reading this parcel&apos;s data…
      </p>
      <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-surface-2" />
      <div className="mt-2 h-16 animate-pulse rounded bg-surface-2" />
    </div>
  );
}
