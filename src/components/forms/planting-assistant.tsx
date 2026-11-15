"use client";

import { useState, useTransition } from "react";
import { draftPlanting } from "@/actions/planting";
import { Icon } from "@/components/ui/icon";
import type { PlantingDraft } from "@/lib/ai/planting";

export function PlantingAssistant({ onFill }: { onFill: (draft: PlantingDraft) => void }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const fill = () =>
    startTransition(async () => {
      const r = await draftPlanting(text);
      if (!r.draft) return setMessage(r.error ?? "Something went wrong.");
      onFill(r.draft);
      setMessage(
        r.draft.unrecognised.length
          ? `Filled what you said. Please check: ${r.draft.unrecognised.join(", ")}.`
          : "Form filled. Check it below, then save.",
      );
    });

  return (
    <section className="rounded-3xl border-2 border-brand bg-brand-soft p-5">
      <label htmlFor="planting-text" className="flex items-center gap-2 text-lg font-extrabold">
        <Icon name="assistant" size={22} className="text-brand" /> Describe it in your own words
      </label>
      <p className="mt-1 text-sm text-muted">The AI fills the form for you. Nothing is saved until you press Save.</p>
      <textarea
        id="planting-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={400}
        rows={2}
        placeholder="e.g. Planted cowpea in rows on 12 March, major season"
        className="mt-3 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 py-3 text-lg outline-none focus:border-brand"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={fill}
          disabled={pending || text.trim().length < 5}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-bold text-brand-ink disabled:opacity-50"
        >
          <Icon name="assistant" size={20} />
          {pending ? "Reading…" : "Fill the form"}
        </button>
        {message && (
          <p role="status" className="font-semibold">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
