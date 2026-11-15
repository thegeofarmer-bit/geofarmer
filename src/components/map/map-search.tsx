"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { MapParcel } from "./types";

export function MapSearch({ parcels, onSelect }: { parcels: MapParcel[]; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const results = needle
    ? parcels.filter((p) => `${p.id} ${p.farmer ?? ""} ${p.crop ?? ""}`.toLowerCase().includes(needle)).slice(0, 8)
    : [];

  return (
    <div className="pointer-events-auto relative max-w-2xl">
      <label className="flex items-center gap-3 rounded-full border-2 border-line-strong bg-surface px-5 py-3.5 shadow-sm">
        <Icon name="search" size={26} />
        <span className="sr-only">Search parcel or farmer</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parcel or farmer"
          className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-ink"
        />
      </label>
      {results.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border-2 border-line-strong bg-surface shadow-lg">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onSelect(p.id);
                }}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-surface-2"
              >
                <span className="h-4 w-4 rounded-sm border border-ink/40" style={{ background: p.color }} />
                <span className="font-mono font-bold">{p.id}</span>
                <span className="truncate text-muted">{[p.farmer, p.crop].filter(Boolean).join(" · ") || "Unassigned"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
