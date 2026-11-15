import { RelativeBadge } from "@/components/ui/badges";
import { relativeLevel } from "@/lib/variables";

export function RelativeHeadline({ value }: { value: number }) {
  return (
    <p className="font-mono text-2xl font-bold">
      {relativeLevel(value)}
      <span className="ml-1 text-sm font-medium text-muted">{Math.round(value)}/100</span>
    </p>
  );
}

export function RelativeDetail({ value }: { value: number }) {
  return (
    <>
      <div className="relative my-2 h-3 rounded-full border-[1.5px] border-line-strong bg-surface-2" aria-hidden="true">
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-ink"
          style={{ left: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <RelativeBadge />
        <span className="text-[15px] text-muted">GIS team soil map, 250 m</span>
      </div>
      <p className="mt-2 text-[15px] text-muted">
        Where this parcel sits between the lowest and highest in the study area. Not a measured value, so crop scores
        don&apos;t use it.
      </p>
    </>
  );
}
