"use client";

import { useActionState } from "react";
import { updateSeasonStatus } from "@/actions/seasons";
import type { CropSeason } from "@/lib/types";
import { Status } from "./form-parts";

export function SeasonStatusForm({ season }: { season: CropSeason }) {
  const [state, action, pending] = useActionState(updateSeasonStatus, null);
  return (
    <form action={action} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="season_id" value={season.season_id} />
      <input type="hidden" name="parcel_id" value={season.parcel_id} />
      <label className="text-sm font-semibold">
        Status
        <select name="crop_status" defaultValue={season.crop_status} className="mt-1 w-full rounded-xl border-2 border-line-strong bg-surface px-3 py-2 text-base">
          {["Planned", "Growing", "Harvested", "Failed"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Actual harvest
        <input type="date" name="actual_harvest_date" defaultValue={season.actual_harvest_date ?? ""} min={season.planting_date} className="mt-1 w-full rounded-xl border-2 border-line-strong bg-surface px-3 py-2 text-base" />
      </label>
      <button disabled={pending} className="rounded-xl bg-brand px-5 py-2.5 font-bold text-brand-ink disabled:opacity-60">
        {pending ? "Saving…" : "Update"}
      </button>
      <div className="sm:col-span-3"><Status state={state} /></div>
    </form>
  );
}
