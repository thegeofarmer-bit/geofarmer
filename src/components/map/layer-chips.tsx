"use client";

import { CROP_LAYER, type MapLayerOption } from "./types";

export function LayerChips({
  layers,
  active,
  onChange,
}: {
  layers: MapLayerOption[];
  active: string;
  onChange: (key: string) => void;
}) {
  const chips = [{ key: CROP_LAYER, label: "Crops", empty: false }, ...layers.map((l) => ({
    key: l.key,
    label: l.label,
    empty: Object.keys(l.values).length === 0,
  }))];
  return (
    <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          disabled={c.empty}
          title={c.empty ? "No data for this layer yet" : undefined}
          onClick={() => onChange(c.key)}
          className={`shrink-0 rounded-full border-2 px-4 py-2 font-semibold ${
            c.key === active ? "border-brand bg-brand text-brand-ink" : "border-line-strong bg-surface"
          } disabled:border-dashed disabled:opacity-50`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
