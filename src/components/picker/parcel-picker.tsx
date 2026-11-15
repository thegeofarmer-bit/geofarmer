"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export interface PickerParcel {
  id: string;
  farmer: string | null;
  crop: string | null;
  color: string;
  area: number | null;
}

export function ParcelPicker({ parcels, suffix }: { parcels: PickerParcel[]; suffix: "crops" | "rotation" }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = parcels.filter((p) => !needle || `${p.id} ${p.farmer ?? ""} ${p.crop ?? ""}`.toLowerCase().includes(needle));
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 rounded-full border-2 border-line-strong bg-surface px-5 py-3.5">
        <Icon name="search" size={24} />
        <span className="sr-only">Search parcel or farmer</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search parcel or farmer"
          className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-muted"
        />
      </label>
      <ul className="card divide-y-[1.5px] divide-line">
        {shown.slice(0, 60).map((p) => (
          <li key={p.id}>
            <Link href={`/parcel/${p.id}/${suffix}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2">
              <span className="h-5 w-5 shrink-0 rounded border-[1.5px] border-ink" style={{ background: p.color }} />
              <span className="font-mono text-lg font-bold">{p.id}</span>
              <span className="min-w-0 flex-1 truncate text-muted">
                {[p.farmer ?? "Unassigned", p.area != null ? `${p.area.toFixed(1)} ha` : null, p.crop].filter(Boolean).join(" · ")}
              </span>
              <Icon name="chev" size={20} />
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="px-5 py-4 text-muted">No parcels match “{q}”.</li>}
      </ul>
      {shown.length > 60 && <p className="text-sm text-muted">Showing 60 of {shown.length}. Search to narrow down.</p>}
    </div>
  );
}
