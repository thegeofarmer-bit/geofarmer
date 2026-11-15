import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { readClient } from "./supabase";
import type {
  Crop,
  CropSeason,
  Dataset,
  EnvValue,
  Farmer,
  MoistureClass,
  ParcelOverview,
} from "./types";

export const DATA_TAG = "geofarmer";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function getParcels(): Promise<ParcelOverview[]> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  return unwrap(await readClient().from("parcel_overview").select("*").order("parcel_id"));
}

export async function getParcel(id: string): Promise<ParcelOverview | null> {
  const parcels = await getParcels();
  return parcels.find((p) => p.parcel_id === id) ?? null;
}

export async function getCrops(): Promise<Crop[]> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  return unwrap(await readClient().from("crop_reference").select("*").order("crop_id"));
}

export async function getDatasets(): Promise<Dataset[]> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  return unwrap(await readClient().from("datasets").select("*"));
}

export async function getFarmers(): Promise<Farmer[]> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  return unwrap(await readClient().from("farmers").select("*").order("farmer_id"));
}

export async function getEnvironment(parcelId: string): Promise<EnvValue[]> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  return unwrap(await readClient().from("parcel_environment").select("*").eq("parcel_id", parcelId));
}

export async function getVariableByParcel(variable: string): Promise<Record<string, number>> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  const rows: Pick<EnvValue, "parcel_id" | "value">[] = unwrap(
    await readClient().from("parcel_environment").select("parcel_id,value").eq("variable", variable),
  );
  return Object.fromEntries(rows.map((r) => [r.parcel_id, Number(r.value)]));
}

export async function getMoisture(parcelId: string): Promise<MoistureClass[]> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  return unwrap(
    await readClient()
      .from("moisture_class_distribution")
      .select("parcel_id,moisture_class,class_percent")
      .eq("parcel_id", parcelId)
      .order("moisture_class"),
  );
}

export async function getSeasons(parcelId: string): Promise<CropSeason[]> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  return unwrap(
    await readClient()
      .from("crop_seasons")
      .select("*")
      .eq("parcel_id", parcelId)
      .order("planting_date", { ascending: false })
      .order("created_at", { ascending: false }),
  );
}

export async function getAllSeasons(): Promise<CropSeason[]> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  return unwrap(
    await readClient().from("crop_seasons").select("*").order("planting_date", { ascending: false }),
  );
}
