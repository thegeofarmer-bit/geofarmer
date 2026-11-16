import type { AssistantContext } from "./context";

export interface ChatLink {
  label: string;
  href: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
const sentences = (parts: string[]) => parts.map((r) => r.trim().replace(/\.+$/, "")).join(". ");

const INTENTS: [RegExp, RegExp][] = [
  [/^why is/i, /\bwhy\b/i],
  [/same family/i, /\bfamily\b/i],
  [/data is missing/i, /\bmissing\b/i],
  [/land zone/i, /\bzone\b/i],
  [/fix nitrogen/i, /\bnitrogen\b.*\bfix|\bfix\w*\b.*\bnitrogen\b/i],
  [/^what should i plant/i, /\bplant\b|\bgrow\b/i],
  [/are similar/i, /\bsimilar\b/i],
];

const sameIntent = (option: string, question: string) =>
  INTENTS.some(([o, q]) => o.test(option) && q.test(question));

export function recommendation(ctx: AssistantContext) {
  const p = ctx.parcel;
  if (!p) return null;
  if (p.rotation) {
    const why = p.rotation.recommended.reasons.filter((r) => r.startsWith("+")).map((r) => r.slice(2));
    return { crop: p.rotation.recommended.crop, why, basis: "rotation" as const };
  }
  const top = p.suitability.top[0];
  return top ? { crop: top.crop, why: top.reasons, basis: "suitability" as const } : null;
}

export function sameFamily(ctx: AssistantContext, crop: string) {
  const family = ctx.project.crop_reference.find((c) => c.crop === crop)?.family;
  return family ? { family, crops: ctx.project.crop_reference.filter((c) => c.family === family && c.crop !== crop).map((c) => c.crop) } : null;
}

export function followUps(ctx: AssistantContext, question: string, history: string[]): string[] {
  const p = ctx.parcel;
  const rec = recommendation(ctx);
  const options = p
    ? [
        rec && `Why is ${rec.crop} recommended for ${p.parcel.id}?`,
        p.rotation && `Which crops are in the same family as ${p.rotation.last_crop}?`,
        `What data is missing for ${p.parcel.id}?`,
        p.land_zone && `What land zone is ${p.parcel.id} in?`,
        p.similar_parcels.length > 0 && `Which parcels are similar to ${p.parcel.id}?`,
        "Which crops fix nitrogen?",
      ]
    : [
        "Which parcels can I ask about?",
        "What should I plant on P001?",
        "Which crops fix nitrogen?",
        "How is crop suitability calculated?",
        "Which data comes from NASA?",
      ];
  const asked = new Set([question, ...history].map(norm));
  return options.filter((q): q is string => !!q && !asked.has(norm(q)) && !sameIntent(q, question)).slice(0, 3);
}

export function links(ctx: AssistantContext): ChatLink[] {
  const id = ctx.parcel?.parcel.id;
  if (!id) return [{ label: "Browse parcels on the map", href: "/map" }];
  return [
    { label: `Assess crops on ${id}`, href: `/parcel/${id}/crops` },
    { label: "Rotation plan", href: `/parcel/${id}/rotation` },
    { label: "Show on map", href: `/map?parcel=${id}` },
  ];
}

const FAMILY_Q = /\bsame family\b|\bfamily\b/i;
const WHY_Q = /\bwhy\b.*\b(recommend|suggest|best|plant)/i;
const NITROGEN_Q = /\b(fix|fixes|fixing)\b.*\bnitrogen\b/i;

export function ruleAnswer(ctx: AssistantContext, question: string): string | null {
  const p = ctx.parcel;
  const rec = recommendation(ctx);
  if (NITROGEN_Q.test(question)) {
    const fixers = ctx.project.crop_reference.filter((c) => c.fixes_nitrogen).map((c) => c.crop);
    return `In GeoFarmer's crop table, ${fixers.join(", ")} fix nitrogen.`;
  }
  if (FAMILY_Q.test(question)) {
    const named = ctx.project.crop_reference.find((c) => new RegExp(`\\b${c.crop}\\b`, "i").test(question))?.crop;
    const crop = named ?? p?.rotation?.last_crop;
    if (!crop) return p ? `No crop season is recorded for ${p.parcel.id} yet, so there is no last crop to compare.` : null;
    const fam = sameFamily(ctx, crop);
    if (!fam) return null;
    const lead = named ? crop : `The last crop on ${p!.parcel.id} was ${crop}`;
    return fam.crops.length
      ? `${lead} (${fam.family} family). Other crops in the same family: ${fam.crops.join(", ")}. Rotation takes 25 points off a crop from the same family, so a different family is the better next crop.`
      : `${lead} (${fam.family} family). No other crop in GeoFarmer's table is in that family.`;
  }
  if (WHY_Q.test(question) && p && rec) {
    const basis = rec.basis === "rotation" ? `after ${p.rotation!.last_crop}` : "on suitability, since no season is recorded yet";
    return `${rec.crop} is recommended for ${p.parcel.id} ${basis}. ${sentences(rec.why.slice(0, 3))}.`;
  }
  return null;
}

export function rulesSummary(ctx: AssistantContext): string {
  const p = ctx.parcel;
  const rec = recommendation(ctx);
  if (!p || !rec) return "Ask about a parcel (for example P001), crop families, nitrogen-fixing crops, or where the data comes from.";
  return `For ${p.parcel.id}, the rules suggest ${rec.crop}. ${sentences(rec.why.slice(0, 2))}.`;
}
