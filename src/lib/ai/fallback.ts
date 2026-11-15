import type { AdviceFacts } from "./facts";
import type { Advice } from "./grounding";

const list = (items: string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : (items[0] ?? "");

export function rulesAdvice(facts: AdviceFacts): Advice {
  const rot = facts.rotation;
  const top = facts.suitability.top[0];
  const recommended = rot?.recommended.crop ?? top?.crop ?? null;

  const headline = rot
    ? `${rot.recommended.crop} is the suggested next crop after ${rot.last_crop}.`
    : top
      ? `${top.crop} scores highest on this parcel's available data.`
      : "There is not enough data to rank crops on this parcel yet.";

  const summary = [
    rot ? `The rules suggest ${rot.recommended.crop}: ${rot.recommended.reasons.map((r) => r.slice(2)).join(" ")}` : "",
    top ? `On suitability, ${top.crop} scores ${top.score} out of 100, based on ${facts.suitability.factors_used} factors.` : "",
    facts.relative.length ? `Soil ${list(facts.relative.map((r) => `${r.name.replace(/^soil /, "")} is ${r.level.toLowerCase()}`))} compared with other parcels.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const nextSteps = [
    recommended ? `Consider ${recommended} for the next season.` : "Record a planting season so rotation advice can start.",
    rot?.also_possible.length ? `Other options: ${list(rot.also_possible)}.` : "",
    rot?.avoid.length ? `Avoid ${list(rot.avoid)} next.` : "",
  ].filter(Boolean);

  const cautions = [
    facts.missing.length ? `Not measured yet: ${list(facts.missing)}.` : "",
    facts.relative.length ? "Soil chemistry levels are relative, not measured values." : "",
    "This is decision support, not a yield promise.",
  ].filter(Boolean);

  return {
    recommended_crop: recommended,
    headline,
    summary: summary || headline,
    next_steps: nextSteps.slice(0, 3),
    cautions: cautions.slice(0, 3),
  };
}
