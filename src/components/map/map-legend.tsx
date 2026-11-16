import { valueRange } from "./geo";
import type { LegendItem, MapLayerOption } from "./types";

export function MapLegend({ layer, items, className = "" }: { layer?: MapLayerOption; items: LegendItem[]; className?: string }) {
  const range = valueRange(layer);
  return (
    <div className={`pointer-events-auto min-w-0 rounded-2xl border-2 border-line-strong bg-surface px-4 py-3 shadow-sm ${className}`}>
      {layer?.categories ? (
        <ul className="space-y-1">
          {layer.categories.map((c) => (
            <li key={c.value} className="flex items-center gap-2 text-[15px]">
              <span className="h-4 w-4 shrink-0 rounded border-[1.5px] border-ink" style={{ background: c.color }} />
              {c.label}
            </li>
          ))}
        </ul>
      ) : layer && range ? (
        <div className="w-52 max-w-full">
          <p className="font-semibold">
            {layer.label} <span className="text-muted">({layer.unit})</span>
          </p>
          <div
            className="mt-2 h-3 rounded-full"
            style={{ background: `linear-gradient(90deg, ${layer.ramp[0]}, ${layer.ramp[1]})` }}
          />
          <div className="mt-1 flex justify-between font-mono text-sm">
            <span>{range.min.toFixed(1)}</span>
            <span>{range.max.toFixed(1)}</span>
          </div>
        </div>
      ) : (
        <div>
        <p className="mb-1 text-sm font-semibold text-muted">Last crop grown</p>
        <ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
          {items.map((l) => (
            <li key={l.name} className="flex items-center gap-2 text-[15px]">
              <span className="h-4 w-4 rounded border-[1.5px] border-ink" style={{ background: l.color }} />
              {l.name}
            </li>
          ))}
        </ul>
        </div>
      )}
    </div>
  );
}
