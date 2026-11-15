import type { VariableDef } from "@/lib/variables";

export function RangeBar({ value, scale }: { value: number; scale: NonNullable<VariableDef["scale"]> }) {
  const pct = (v: number) => `${Math.max(0, Math.min(100, ((v - scale.min) / (scale.max - scale.min)) * 100))}%`;
  return (
    <div className="relative my-2 h-3 rounded-full border-[1.5px] border-line-strong bg-surface-2" aria-hidden="true">
      <div
        className="absolute inset-y-0 border-x-2 border-brand bg-brand-soft"
        style={{ left: pct(scale.goodMin), width: `calc(${pct(scale.goodMax)} - ${pct(scale.goodMin)})` }}
      />
      <div
        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-ink"
        style={{ left: pct(value) }}
      />
    </div>
  );
}
