import "server-only";
import { createHash } from "node:crypto";
import { writeClient } from "../supabase";

const DAILY_NEURON_BUDGET = 9000;

export interface CachedAnswer<T> {
  content: T;
  source: "ai" | "rules";
  model: string;
  created_at: string;
}

export function cacheKey(...parts: unknown[]): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

export async function readCache<T>(key: string): Promise<CachedAnswer<T> | null> {
  const { data } = await writeClient()
    .from("ai_cache")
    .select("content,source,model,created_at")
    .eq("cache_key", key)
    .maybeSingle();
  return (data as CachedAnswer<T> | null) ?? null;
}

export async function writeCache(row: {
  key: string;
  kind: "advice" | "chat";
  parcelId: string | null;
  model: string;
  promptVersion: string;
  content: unknown;
  neurons: number;
}): Promise<string> {
  const created_at = new Date().toISOString();
  await writeClient().from("ai_cache").upsert({
    cache_key: row.key,
    kind: row.kind,
    parcel_id: row.parcelId,
    model: row.model,
    prompt_version: row.promptVersion,
    source: "ai",
    content: row.content,
    neurons: row.neurons,
    created_at,
  });
  return created_at;
}

export async function budgetLeft(): Promise<boolean> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const { data } = await writeClient().from("ai_cache").select("neurons").gte("created_at", since.toISOString());
  const used = (data ?? []).reduce((sum, r) => sum + Number(r.neurons), 0);
  return used < DAILY_NEURON_BUDGET;
}
