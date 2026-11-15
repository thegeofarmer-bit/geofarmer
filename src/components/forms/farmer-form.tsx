"use client";

import { useActionState } from "react";
import { saveFarmer } from "@/actions/farmers";
import type { Farmer } from "@/lib/types";
import { Status } from "./form-parts";

export function FarmerForm({ farmer }: { farmer?: Farmer }) {
  const [state, action, pending] = useActionState(saveFarmer, null);
  const small = "mt-1 w-full rounded-xl border-2 border-line-strong bg-surface px-3 py-2.5 text-base";
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-3 sm:items-end">
      {farmer && <input type="hidden" name="farmer_id" value={farmer.farmer_id} />}
      <label className="text-sm font-semibold">Name<input name="farmer_name" required defaultValue={farmer?.farmer_name} className={small} /></label>
      <label className="text-sm font-semibold">Community<input name="community" defaultValue={farmer?.community ?? ""} className={small} /></label>
      <label className="text-sm font-semibold">Preferred crops<input name="preferred_crops" defaultValue={farmer?.preferred_crops ?? ""} placeholder="maize; cowpea" className={small} /></label>
      <div className="sm:col-span-3 flex items-center gap-4">
        <button disabled={pending} className="rounded-xl bg-brand px-5 py-2.5 font-bold text-brand-ink disabled:opacity-60">
          {pending ? "Saving…" : farmer ? "Save changes" : "Add farmer"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}
