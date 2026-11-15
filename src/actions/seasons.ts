"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { DATA_TAG } from "@/lib/data";
import { writeClient } from "@/lib/supabase";
import type { FormState } from "./form-state";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date");

const SeasonInput = z
  .object({
    parcel_id: z.string().min(1),
    crop_id: z.string().min(1, "Pick a crop"),
    season_name: z.enum(["Major", "Minor"]),
    planting_method: z.enum(["Rows", "Broadcast", "Mounds", "Ridges"]),
    planting_date: date,
    expected_harvest_date: date.or(z.literal("")),
    crop_variety: z.string().max(80).optional(),
  })
  .refine((v) => !v.expected_harvest_date || v.expected_harvest_date >= v.planting_date, {
    message: "Harvest date must be after the planting date",
  });

export async function recordSeason(_: FormState, form: FormData): Promise<FormState> {
  const parsed = SeasonInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const { error } = await writeClient()
    .from("crop_seasons")
    .insert({
      parcel_id: v.parcel_id,
      crop_id: v.crop_id,
      season_name: v.season_name,
      season_year: Number(v.planting_date.slice(0, 4)),
      planting_date: v.planting_date,
      expected_harvest_date: v.expected_harvest_date || null,
      crop_variety: v.crop_variety?.trim() || null,
      planting_method: v.planting_method,
      crop_status: v.planting_date > new Date().toISOString().slice(0, 10) ? "Planned" : "Growing",
      is_simulated: true,
    });
  if (error) return { error: error.message };
  updateTag(DATA_TAG);
  redirect(`/parcel/${v.parcel_id}?saved=1`);
}

const StatusInput = z.object({
  season_id: z.string().min(1),
  parcel_id: z.string().min(1),
  crop_status: z.enum(["Planned", "Growing", "Harvested", "Failed"]),
  actual_harvest_date: date.or(z.literal("")),
});

export async function updateSeasonStatus(_: FormState, form: FormData): Promise<FormState> {
  const parsed = StatusInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const db = writeClient();
  const { data: previous, error: readError } = await db.from("crop_seasons").select("*").eq("season_id", v.season_id).single();
  if (readError) return { error: readError.message };
  if (v.actual_harvest_date && v.actual_harvest_date < previous.planting_date) {
    return { error: "Harvest date must be after the planting date" };
  }
  const { error: logError } = await db
    .from("crop_season_corrections")
    .insert({ season_id: v.season_id, previous, reason: "Status update" });
  if (logError) return { error: logError.message };
  const { error } = await db
    .from("crop_seasons")
    .update({ crop_status: v.crop_status, actual_harvest_date: v.actual_harvest_date || null })
    .eq("season_id", v.season_id);
  if (error) return { error: error.message };
  updateTag(DATA_TAG);
  return { ok: "Season updated. The previous version was kept in the history log." };
}
