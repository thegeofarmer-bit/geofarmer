import { z } from "zod";
import { expectedCrop, type AdviceFacts } from "./facts";

export const AdviceSchema = z.object({
  recommended_crop: z.string().nullable(),
  headline: z.string().min(1).max(160),
  summary: z.string().min(1).max(900),
  next_steps: z.array(z.string().min(1).max(300)).min(1).max(3),
  cautions: z.array(z.string().min(1).max(300)).min(1).max(3),
});

export type Advice = z.infer<typeof AdviceSchema>;

const OTHER_CROPS = [
  "tomato", "onion", "pepper", "plantain", "cocoa", "millet", "sorghum", "okra", "cabbage",
  "sweet potato", "potato", "wheat", "bean", "sesame", "cotton", "cashew", "mango", "banana", "garden egg",
];

const NUMBER = /\d+(?:[.,]\d+)*/g;

function normalise(n: string): string[] {
  const v = Number(n.replace(/,/g, ""));
  if (Number.isNaN(v)) return [n];
  return [String(v), v.toFixed(0), v.toFixed(1), v.toFixed(2)];
}

function allowedNumbers(facts: AdviceFacts): Set<string> {
  const allowed = new Set<string>();
  for (const m of JSON.stringify(facts).match(NUMBER) ?? []) for (const v of normalise(m)) allowed.add(v);
  for (const m of facts.parcel.id.match(/\d+/g) ?? []) allowed.add(String(Number(m)));
  return allowed;
}

export function groundingIssues(advice: Advice, facts: AdviceFacts): string[] {
  const issues: string[] = [];
  const expected = expectedCrop(facts);
  if ((advice.recommended_crop ?? null) !== expected) {
    issues.push(`recommended_crop must be ${JSON.stringify(expected)}`);
  }

  const text = [advice.headline, advice.summary, ...advice.next_steps, ...advice.cautions].join(" ");
  const allowed = allowedNumbers(facts);
  const stray = (text.match(NUMBER) ?? []).filter((n) => !normalise(n).some((v) => allowed.has(v)));
  if (stray.length) issues.push(`numbers not in the facts: ${[...new Set(stray)].join(", ")}`);

  const lower = text.toLowerCase();
  const known = new Set(facts.crops.map((c) => c.toLowerCase()));
  const foreign = OTHER_CROPS.filter((c) => !known.has(c) && new RegExp(`\\b${c}s?\\b`).test(lower));
  if (foreign.length) issues.push(`crops not in the reference table: ${foreign.join(", ")}`);

  if (/\b(guarantee[sd]?|will definitely|certain to)\b/.test(lower)) issues.push("promises an outcome");
  return issues;
}
