"use client";

import { useActionState } from "react";
import { assignFarmer } from "@/actions/farmers";
import type { Farmer } from "@/lib/types";
import { Status } from "./form-parts";

export function AssignFarmerForm({ parcelId, farmers, current }: { parcelId: string; farmers: Farmer[]; current: string | null }) {
  const [state, action, pending] = useActionState(assignFarmer, null);
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="parcel_id" value={parcelId} />
      <select name="farmer_id" defaultValue={current ?? ""} aria-label="Farmer" className="min-w-0 flex-1 rounded-xl border-2 border-line-strong bg-surface px-3 py-2.5 text-base">
        <option value="">No farmer assigned</option>
        {farmers.map((f) => <option key={f.farmer_id} value={f.farmer_id}>{f.farmer_name}</option>)}
      </select>
      <button disabled={pending} className="rounded-xl border-2 border-brand px-4 py-2 font-bold text-brand disabled:opacity-60">
        {pending ? "Saving…" : "Assign"}
      </button>
      <Status state={state} />
    </form>
  );
}
