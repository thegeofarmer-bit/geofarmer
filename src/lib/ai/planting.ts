import "server-only";
import { z } from "zod";
import type { Crop } from "../types";
import { ADVICE_MODEL } from "./prompt";
import { runJson } from "./workers-ai";

const METHODS = ["Rows", "Broadcast", "Mounds", "Ridges"] as const;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MENTIONS_DATE = /\d|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|today|yesterday|tomorrow|last|next|ago/i;

export interface PlantingDraft {
  crop_id: string | null;
  season_name: "Major" | "Minor" | null;
  planting_method: (typeof METHODS)[number] | null;
  planting_date: string | null;
  expected_harvest_date: string | null;
  unrecognised: string[];
}

const Draft = z.object({
  crop: z.string().nullable(),
  season: z.enum(["Major", "Minor"]).nullable(),
  method: z.enum(METHODS).nullable(),
  planting_date: z.string().nullable(),
  expected_harvest_date: z.string().nullable(),
});

function schema(crops: Crop[]) {
  const nullable = (values: readonly string[]) => ({ type: ["string", "null"], enum: [...values, null] });
  return {
    type: "object",
    additionalProperties: false,
    required: ["crop", "season", "method", "planting_date", "expected_harvest_date"],
    properties: {
      crop: nullable(crops.map((c) => c.crop_name)),
      season: nullable(["Major", "Minor"]),
      method: nullable(METHODS),
      planting_date: { type: ["string", "null"] },
      expected_harvest_date: { type: ["string", "null"] },
    },
  };
}

function validDate(d: string | null, text: string, today: string): string | null {
  if (!d || !DATE.test(d) || !MENTIONS_DATE.test(text) || Number.isNaN(Date.parse(d))) return null;
  const years = Math.abs(Date.parse(d) - Date.parse(today)) / (365 * 864e5);
  return years <= 2 ? d : null;
}

export async function parsePlanting(text: string, crops: Crop[]): Promise<PlantingDraft> {
  const today = new Date().toISOString().slice(0, 10);
  const run = await runJson(
    ADVICE_MODEL,
    [
      {
        role: "system",
        content:
          `Extract a planting record from the farmer's words. Today is ${today}. ` +
          `Allowed crops: ${crops.map((c) => c.crop_name).join(", ")}. Methods: ${METHODS.join(", ")} ` +
          `(rows/row planting = Rows, scattered = Broadcast, heaps = Mounds). Seasons in Ghana: Major or Minor. ` +
          "Dates as YYYY-MM-DD. Use null for anything the farmer did not say. Never guess. JSON only.",
      },
      { role: "user", content: text },
    ],
    schema(crops),
    { timeoutMs: 20_000 },
  );
  const d = Draft.parse(run.json);
  const crop = crops.find((c) => c.crop_name.toLowerCase() === d.crop?.toLowerCase());
  const planting = validDate(d.planting_date, text, today);
  const harvest = validDate(d.expected_harvest_date, text, today);
  const draft: PlantingDraft = {
    crop_id: crop?.crop_id ?? null,
    season_name: d.season,
    planting_method: d.method,
    planting_date: planting,
    expected_harvest_date: harvest && planting && harvest >= planting ? harvest : null,
    unrecognised: [],
  };
  if (!draft.crop_id) draft.unrecognised.push("crop");
  if (!draft.planting_date) draft.unrecognised.push("planting date");
  if (!draft.planting_method) draft.unrecognised.push("planting method");
  if (!draft.season_name) draft.unrecognised.push("season");
  return draft;
}
