"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { DATA_TAG } from "@/lib/data";
import { writeClient } from "@/lib/supabase";
import type { FormState } from "./form-state";

const FarmerInput = z.object({
  farmer_id: z.string().optional(),
  farmer_name: z.string().trim().min(2, "Enter the farmer's name").max(80),
  community: z.string().trim().max(80).optional(),
  preferred_crops: z.string().trim().max(120).optional(),
});

export async function saveFarmer(_: FormState, form: FormData): Promise<FormState> {
  const parsed = FarmerInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const db = writeClient();
  const row = { farmer_name: v.farmer_name, community: v.community || null, preferred_crops: v.preferred_crops || null };
  if (v.farmer_id) {
    const { error } = await db.from("farmers").update(row).eq("farmer_id", v.farmer_id);
    if (error) return { error: error.message };
  } else {
    const { data: ids, error: idError } = await db.from("farmers").select("farmer_id").like("farmer_id", "DEMO-F%");
    if (idError) return { error: idError.message };
    const next = Math.max(0, ...ids.map((r) => Number(r.farmer_id.replace("DEMO-F", "")) || 0)) + 1;
    const { error } = await db
      .from("farmers")
      .insert({ ...row, farmer_id: `DEMO-F${String(next).padStart(3, "0")}`, is_simulated: true });
    if (error) return { error: error.message };
  }
  updateTag(DATA_TAG);
  return { ok: v.farmer_id ? "Farmer updated." : "Farmer added." };
}

export async function assignFarmer(_: FormState, form: FormData): Promise<FormState> {
  const parcel_id = String(form.get("parcel_id") ?? "");
  const farmer_id = String(form.get("farmer_id") ?? "") || null;
  if (!parcel_id) return { error: "Missing parcel" };
  const { error } = await writeClient().from("farm_parcels").update({ farmer_id }).eq("parcel_id", parcel_id);
  if (error) return { error: error.message };
  updateTag(DATA_TAG);
  return { ok: farmer_id ? "Farmer assigned." : "Farmer removed." };
}
