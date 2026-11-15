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

function parse(n: string): number {
  return Number(n.replace(/,(?=\d{3}\b)/g, ""));
}

function decimals(n: string): number {
  return n.replace(/,(?=\d{3}\b)/g, "").split(".")[1]?.length ?? 0;
}

function sourceValues(sources: unknown[]): number[] {
  const values: number[] = [];
  for (const src of sources) {
    const text = typeof src === "string" ? src : JSON.stringify(src);
    for (const m of text.match(NUMBER) ?? []) values.push(parse(m));
  }
  return values;
}

export function strayNumbers(text: string, sources: unknown[]): string[] {
  const values = sourceValues(sources);
  const ok = (n: string) => {
    const v = parse(n);
    const d = decimals(n);
    return values.some((a) => Number(a.toFixed(d)) === v);
  };
  return [...new Set((text.match(NUMBER) ?? []).filter((n) => !ok(n)))];
}

export function foreignCrops(text: string, crops: string[]): string[] {
  const lower = text.toLowerCase();
  const known = new Set(crops.map((c) => c.toLowerCase()));
  return OTHER_CROPS.filter((c) => !known.has(c) && new RegExp(`\\b${c}(?:e?s)?\\b`).test(lower));
}

const PROMISE = /\b(guarantee[sd]?|will definitely|certain to)\b/gi;
const NEGATION = /\b(not|no|never|without|cannot|can't)\b[^.]{0,20}$/i;

export function promisesOutcome(text: string): boolean {
  for (const m of text.matchAll(PROMISE)) {
    if (!NEGATION.test(text.slice(Math.max(0, m.index - 30), m.index))) return true;
  }
  return false;
}

export function groundingIssues(advice: Advice, facts: AdviceFacts): string[] {
  const issues: string[] = [];
  const expected = expectedCrop(facts);
  if ((advice.recommended_crop ?? null) !== expected) {
    issues.push(`recommended_crop must be ${JSON.stringify(expected)}`);
  }

  const text = [advice.headline, advice.summary, ...advice.next_steps, ...advice.cautions].join(" ");
  const stray = strayNumbers(text, [facts]);
  if (stray.length) issues.push(`numbers not in the facts: ${stray.join(", ")}`);
  const foreign = foreignCrops(text, facts.crops);
  if (foreign.length) issues.push(`crops not in the reference table: ${foreign.join(", ")}`);
  if (promisesOutcome(text)) issues.push("promises an outcome");
  return issues;
}
