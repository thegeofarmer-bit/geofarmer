"use server";

import { z } from "zod";
import { askAssistant, type ChatResult } from "@/lib/ai/chat";

const Input = z.object({
  parcelId: z.string().regex(/^P\d{3,}$/).nullable(),
  question: z.string().trim().min(1).max(500),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(20),
});

export async function ask(input: z.input<typeof Input>): Promise<ChatResult> {
  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    return { answer: "Please ask a shorter question.", follow_ups: [], source: "rules", cached: false };
  }
  const { parcelId, question, history } = parsed.data;
  return askAssistant(parcelId, history, question);
}
