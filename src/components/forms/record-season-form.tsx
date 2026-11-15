"use client";

import { useActionState, useState } from "react";
import { recordSeason } from "@/actions/seasons";
import { Callout } from "@/components/ui/callout";
import { Icon } from "@/components/ui/icon";
import type { Crop } from "@/lib/types";
import { Status, Submit, addDays, field, label } from "./form-parts";

export function RecordSeasonForm({ parcelId, crops, defaultCrop }: { parcelId: string; crops: Crop[]; defaultCrop?: string }) {
  const [state, action, pending] = useActionState(recordSeason, null);
  const today = new Date().toISOString().slice(0, 10);
  const [cropId, setCropId] = useState(defaultCrop && crops.some((c) => c.crop_id === defaultCrop) ? defaultCrop : crops[0]?.crop_id);
  const [planting, setPlanting] = useState(today);
  const [season, setSeason] = useState<"Major" | "Minor">(() => {
    const m = new Date().getMonth() + 1;
    return m >= 8 && m <= 11 ? "Minor" : "Major";
  });
  const [method, setMethod] = useState("Rows");
  const [harvestEdited, setHarvestEdited] = useState<string | null>(null);
  const crop = crops.find((c) => c.crop_id === cropId);
  const harvest = harvestEdited ?? (crop ? addDays(planting, crop.crop_duration_days) : "");
  const year = planting.slice(0, 4);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="parcel_id" value={parcelId} />
      <div>
        <label htmlFor="crop" className={label}>Crop</label>
        <div className="relative">
          <select id="crop" name="crop_id" value={cropId} onChange={(e) => { setCropId(e.target.value); setHarvestEdited(null); }} className={`${field} appearance-none pr-12`}>
            {crops.map((c) => (
              <option key={c.crop_id} value={c.crop_id}>{c.crop_name}</option>
            ))}
          </select>
          <Icon name="chev" size={22} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2" />
        </div>
        {crop && <p className="mt-2 text-muted">{crop.crop_family} · about {crop.crop_duration_days} days to harvest</p>}
      </div>

      <fieldset>
        <legend className={label}>Season</legend>
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border-2 border-line-strong">
          {(["Major", "Minor"] as const).map((s) => (
            <label key={s} className={`cursor-pointer py-4 text-center text-xl font-bold ${season === s ? "bg-brand text-brand-ink" : "bg-surface"}`}>
              <input type="radio" name="season_name" value={s} checked={season === s} onChange={() => setSeason(s)} className="sr-only" />
              {s} {year}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>How will you plant?</legend>
        <div className="flex flex-wrap gap-3">
          {["Rows", "Broadcast", "Mounds", "Ridges"].map((m) => (
            <label key={m} className={`cursor-pointer rounded-full border-2 px-6 py-3 text-lg font-bold has-focus-visible:ring-2 ${method === m ? "border-brand bg-brand text-brand-ink" : "border-line-strong bg-surface"}`}>
              <input type="radio" name="planting_method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
              {m}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="planting" className={label}>Planting</label>
          <input id="planting" type="date" name="planting_date" required value={planting} onChange={(e) => setPlanting(e.target.value)} className={`${field} text-lg`} />
        </div>
        <div>
          <label htmlFor="harvest" className={label}>Harvest</label>
          <input id="harvest" type="date" name="expected_harvest_date" value={harvest} min={planting} onChange={(e) => setHarvestEdited(e.target.value)} className={`${field} text-lg`} />
        </div>
      </div>

      <div>
        <label htmlFor="variety" className={label}>Variety <span className="font-normal text-muted">(optional)</span></label>
        <input id="variety" name="crop_variety" placeholder="e.g. Obatanpa" className={field} />
      </div>

      <Callout tone="info" icon="info">
        <b>Saving adds a new season.</b> Your earlier seasons stay as they are.
      </Callout>
      <Status state={state} />
      <Submit pending={pending}>
        <Icon name="check" size={26} /> Save season
      </Submit>
    </form>
  );
}
