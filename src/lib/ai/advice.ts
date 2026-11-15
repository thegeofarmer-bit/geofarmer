import "server-only";
import type { ParcelAnalysis } from "../analysis";
import { budgetLeft, cacheKey, readCache, writeCache } from "./cache";
import { buildFacts, type AdviceFacts } from "./facts";
import { rulesAdvice } from "./fallback";
import { AdviceSchema, groundingIssues, type Advice } from "./grounding";
import { ADVICE_MODEL, ADVICE_SCHEMA, PROMPT_VERSION, SYSTEM_PROMPT } from "./prompt";
import { runJson, type ChatMessage } from "./workers-ai";

export interface AdviceResult {
  advice: Advice;
  source: "ai" | "rules";
  model: string | null;
  createdAt: string | null;
  reason?: string;
}

async function generate(facts: AdviceFacts): Promise<{ advice: Advice; neurons: number } | { issues: string[] }> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Facts:\n${JSON.stringify(facts)}` },
  ];
  let neurons = 0;
  let issues: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const run = await runJson(ADVICE_MODEL, messages, ADVICE_SCHEMA);
    neurons += run.neurons;
    const parsed = AdviceSchema.safeParse(run.json);
    issues = parsed.success ? groundingIssues(parsed.data, facts) : ["output did not match the schema"];
    if (parsed.success && issues.length === 0) return { advice: parsed.data, neurons };
    messages.push(
      { role: "assistant", content: JSON.stringify(run.json) },
      { role: "user", content: `Your answer broke the rules: ${issues.join("; ")}. Fix it using only the facts.` },
    );
  }
  return { issues };
}

export async function getAdvice(a: ParcelAnalysis): Promise<AdviceResult> {
  const facts = buildFacts(a);
  const fallback = (reason: string): AdviceResult => ({
    advice: rulesAdvice(facts),
    source: "rules",
    model: null,
    createdAt: null,
    reason,
  });

  const key = cacheKey("advice", PROMPT_VERSION, ADVICE_MODEL, facts);
  const cached = await readCache<Advice>(key);
  if (cached) return { advice: cached.content, source: "ai", model: cached.model, createdAt: cached.created_at };
  if (!(await budgetLeft())) return fallback("Daily AI allowance reached.");

  try {
    const result = await generate(facts);
    if ("issues" in result) return fallback("The AI answer failed the data check.");
    const createdAt = await writeCache({
      key,
      kind: "advice",
      parcelId: a.parcel.parcel_id,
      model: ADVICE_MODEL,
      promptVersion: PROMPT_VERSION,
      content: result.advice,
      neurons: result.neurons,
    });
    return { advice: result.advice, source: "ai", model: ADVICE_MODEL, createdAt };
  } catch {
    return fallback("The AI service is unavailable.");
  }
}
