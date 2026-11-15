"use client";

import { useActionState } from "react";
import { updateSeasonStatus } from "@/actions/seasons";
import type { CropSeason } from "@/lib/types";
import { Status } from "./form-parts";

const input = "mt-1 w-full rounded-xl border-2 border-line-strong bg-surface px-3 py-2 text-base";

export function SeasonStatusForm({ season }: { season: CropSeason }) {
  const [state, action, pending] = useActionState(updateSeasonStatus, null);
  return (
    <form action={action} className="mt-3 grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="season_id" value={season.season_id} />
      <input type="hidden" name="parcel_id" value={season.parcel_id} />
      <label className="text-sm font-semibold">
        Status
        <select name="crop_status" defaultValue={season.crop_status} className={input}>
          {["Planned", "Growing", "Harvested", "Failed"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Actual harvest
        <input type="date" name="actual_harvest_date" defaultValue={season.actual_harvest_date ?? ""} min={season.planting_date} className={input} />
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-semibold">How did the season go?</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {["", "Poor", "Fair", "Good"].map((o) => (
            <label
              key={o || "none"}
              className="cursor-pointer rounded-full border-2 border-line-strong px-4 py-1.5 font-semibold has-checked:border-brand has-checked:bg-brand has-checked:text-brand-ink"
            >
              <input type="radio" name="outcome" value={o} defaultChecked={(season.outcome ?? "") === o} className="sr-only" />
              {o || "Not yet"}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="text-sm font-semibold">
        Yield (kg/ha, optional)
        <input name="yield_kg_per_ha" inputMode="decimal" defaultValue={season.yield_kg_per_ha ?? ""} className={input} />
      </label>
      <label className="text-sm font-semibold">
        Note (optional)
        <input name="outcome_note" maxLength={300} defaultValue={season.outcome_note ?? ""} placeholder="e.g. late rains" className={input} />
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <button disabled={pending} className="rounded-xl bg-brand px-5 py-2.5 font-bold text-brand-ink disabled:opacity-60">
          {pending ? "Saving…" : "Update"}
        </button>
        <Status state={state} />
      </div>
      <p className="text-xs text-muted sm:col-span-2">
        Outcomes teach GeoFarmer: they adjust crop scores for this parcel and for parcels like it.
      </p>
    </form>
  );
}
