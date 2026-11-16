import "server-only";
import { z } from "zod";
import { budgetLeft, cacheKey, readCache, writeCache } from "./cache";
import { CHAT_PROMPT_VERSION, CHAT_SCHEMA, CHAT_SYSTEM_PROMPT } from "./chat-prompt";
import { getParcels } from "../data";
import { followUps, links, ruleAnswer, rulesSummary, type ChatLink } from "./chat-extras";
import { buildContext, type AssistantContext } from "./context";
import { foreignCrops, promisesOutcome, strayNumbers } from "./grounding";
import { asksAboutAParcel, asksForParcels, parcelMenu, parcelRef, resolveParcel } from "./parcel-ref";
import { ADVICE_MODEL } from "./prompt";
import { runJson, type ChatMessage } from "./workers-ai";

const ReplySchema = z.object({
  answer: z.string().min(1).max(1200),
  follow_ups: z.array(z.string().min(1).max(160)).max(3),
});

type Reply = z.infer<typeof ReplySchema>;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResult extends Reply {
  source: "ai" | "rules";
  cached: boolean;
  parcelId?: string | null;
  links?: ChatLink[];
}

function issuesFor(reply: Reply, ctx: AssistantContext, question: string): string[] {
  const issues: string[] = [];
  const stray = strayNumbers(reply.answer, [ctx, question]);
  if (stray.length) issues.push(`numbers not in the context: ${stray.join(", ")}`);
  const foreign = foreignCrops(reply.answer, ctx.project.crop_reference.map((c) => c.crop));
  if (foreign.length) issues.push(`crops not in the reference table: ${foreign.join(", ")}`);
  if (promisesOutcome(reply.answer)) issues.push("promises an outcome");
  return issues;
}

function safeReply(ctx: AssistantContext, lead = "I couldn't check that answer against GeoFarmer's data."): ChatResult {
  return { answer: `${lead} ${rulesSummary(ctx)}`, follow_ups: [], source: "rules", cached: false };
}

export async function askAssistant(current: string | null, history: ChatTurn[], question: string): Promise<ChatResult> {
  const parcels = await getParcels();
  const parcelId = resolveParcel(question, history, current);
  const known = parcels.find((p) => p.parcel_id === parcelId);
  if (parcelId && !known?.has_geometry) {
    return parcelMenu(parcels, known ? `${parcelId} has no mapped boundary, so GeoFarmer has no land data for it.` : `GeoFarmer has no parcel called ${parcelId}.`);
  }
  if (!parcelRef(question) && asksForParcels(question)) {
    return { ...parcelMenu(parcels, "Here are the parcels you can ask about."), parcelId: current };
  }
  if (!parcelId && asksAboutAParcel(question)) {
    return parcelMenu(parcels, "Which parcel do you mean?");
  }
  const ctx = await buildContext(parcelId);
  const asked = history.filter((t) => t.role === "user").map((t) => t.content);
  const extras = { follow_ups: followUps(ctx, question, asked), links: links(ctx), parcelId };
  const direct = ruleAnswer(ctx, question);
  if (direct) return { answer: direct, source: "rules", cached: false, ...extras };
  const result = await answer(ctx, parcelId, history, question);
  return { ...result, ...extras };
}

async function answer(ctx: AssistantContext, parcelId: string | null, history: ChatTurn[], question: string): Promise<ChatResult> {
  const recent = history.slice(-6).map((t) => ({ role: t.role, content: t.content.slice(0, 800) }));
  const key = cacheKey("chat", CHAT_PROMPT_VERSION, ADVICE_MODEL, ctx, recent, question.trim().toLowerCase());
  const cached = await readCache<Reply>(key);
  if (cached) return { ...cached.content, source: "ai", cached: true };
  if (!(await budgetLeft())) {
    return safeReply(ctx, "Today's AI allowance is used up, so here is the rules result.");
  }

  const messages: ChatMessage[] = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    { role: "system", content: `CONTEXT:\n${JSON.stringify(ctx)}` },
    ...recent,
    { role: "user", content: question },
  ];

  try {
    let neurons = 0;
    for (let attempt = 0; attempt < 2; attempt++) {
      const run = await runJson(ADVICE_MODEL, messages, CHAT_SCHEMA);
      neurons += run.neurons;
      const parsed = ReplySchema.safeParse(run.json);
      const issues = parsed.success ? issuesFor(parsed.data, ctx, question) : ["output did not match the schema"];
      if (parsed.success && issues.length === 0) {
        await writeCache({
          key,
          kind: "chat",
          parcelId,
          model: ADVICE_MODEL,
          promptVersion: CHAT_PROMPT_VERSION,
          content: parsed.data,
          neurons,
        });
        return { ...parsed.data, source: "ai", cached: false };
      }
      messages.push(
        { role: "assistant", content: JSON.stringify(run.json) },
        { role: "user", content: `That answer broke the rules: ${issues.join("; ")}. Answer again using only the CONTEXT.` },
      );
    }
    return safeReply(ctx);
  } catch {
    return safeReply(ctx, "The AI didn't respond in time, so here is the rules result.");
  }
}
