"use server";

import { z } from "zod";
import { parsePlanting, type PlantingDraft } from "@/lib/ai/planting";
import { getCrops } from "@/lib/data";

export async function draftPlanting(text: string): Promise<{ draft?: PlantingDraft; error?: string }> {
  const parsed = z.string().trim().min(5).max(400).safeParse(text);
  if (!parsed.success) return { error: "Describe the planting in a sentence or two." };
  try {
    return { draft: await parsePlanting(parsed.data, await getCrops()) };
  } catch {
    return { error: "The AI couldn't read that right now. Fill the form below instead." };
  }
}
