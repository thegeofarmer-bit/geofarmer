import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DATA_TAG, getVariableByParcel } from "../data";
import { buildZoneModel, ZONE_FEATURES, type ZoneModel } from "./zones";

export async function getZoneModel(): Promise<ZoneModel | null> {
  "use cache";
  cacheTag(DATA_TAG);
  cacheLife("hours");
  const columns = await Promise.all(ZONE_FEATURES.map((f) => getVariableByParcel(f.key)));
  return buildZoneModel(Object.fromEntries(ZONE_FEATURES.map((f, i) => [f.key, columns[i]])));
}
