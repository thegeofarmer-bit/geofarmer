import type { ParcelOverview } from "../types";

export interface ChatTurnLike {
  role: "user" | "assistant";
  content: string;
}

const ID = /\bP\s?-?(\d{1,4})\b/i;
const NUMBERED = /\b(?:parcel|farm|plot|field)\s*(?:no\.?|number|#)?\s*(\d{1,4})\b/i;
const VAGUE = /\b(?:this|my|the|that|our)\s+(?:parcel|farm|plot|field)s?\b|\bplant (?:next|here)\b/i;

export function parcelRef(text: string): string | null {
  const m = text.match(ID) ?? text.match(NUMBERED);
  return m ? `P${m[1]!.padStart(3, "0")}` : null;
}

export function resolveParcel(question: string, history: ChatTurnLike[], current: string | null): string | null {
  const direct = parcelRef(question);
  if (direct) return direct;
  if (current) return current;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i]!.role !== "user") continue;
    const ref = parcelRef(history[i]!.content);
    if (ref) return ref;
  }
  return null;
}

const LIST = /\b(?:which|what|list|show|available|all)\b[^?]{0,20}\b(?:parcels|farms|plots|fields)\b/i;

export const asksForParcels = (question: string) => LIST.test(question);

export const asksAboutAParcel = (question: string) => VAGUE.test(question);

function examples(parcels: ParcelOverview[]) {
  const mapped = parcels.filter((p) => p.has_geometry);
  const withCrops = mapped.filter((p) => p.latest_crop_name);
  return [...withCrops, ...mapped.filter((p) => !p.latest_crop_name)].slice(0, 3);
}

function describe(p: ParcelOverview) {
  const who = [p.farmer_name, p.community].filter(Boolean).join(", ");
  const crop = p.latest_crop_name ? `, last grew ${p.latest_crop_name}` : "";
  return `${p.parcel_id}${who ? ` (${who})` : ""}${crop}`;
}

export function parcelMenu(parcels: ParcelOverview[], intro: string) {
  const mapped = parcels.filter((p) => p.has_geometry).map((p) => p.parcel_id).sort();
  const picks = examples(parcels);
  return {
    answer:
      `${intro} GeoFarmer has ${mapped.length} mapped parcels, ${mapped[0]} to ${mapped[mapped.length - 1]}. ` +
      `For example: ${picks.map(describe).join("; ")}. Name a parcel ID and I'll answer from its data, or tap one on the Map tab.`,
    follow_ups: picks.map((p) => `What should I plant on ${p.parcel_id}?`),
    source: "rules" as const,
    cached: false,
  };
}
