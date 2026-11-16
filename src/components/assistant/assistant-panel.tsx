"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ask } from "@/actions/assistant";
import { Icon } from "@/components/ui/icon";
import { MessageBubble, type UiMessage } from "./message-bubble";

const PARCEL_SUGGESTIONS = [
  "What should I plant next here?",
  "Why is this crop recommended?",
  "What data is missing for this parcel?",
];
const GENERAL_SUGGESTIONS = [
  "Which parcels can I ask about?",
  "How is crop suitability calculated?",
  "Which data comes from NASA?",
  "How does the rotation advice work?",
];

export function AssistantPanel({
  parcelId,
  initialQuestion,
  onClose,
}: {
  parcelId: string | null;
  initialQuestion?: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [focus, setFocus] = useState(parcelId);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLOListElement>(null);
  const asked = useRef(false);

  const send = (question: string) => {
    const q = question.trim();
    if (!q || pending) return;
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    startTransition(async () => {
      const r = await ask({ parcelId: focus, question: q, history });
      if (r.parcelId) setFocus(r.parcelId);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: r.answer, source: r.source, cached: r.cached, followUps: r.follow_ups, links: r.links },
      ]);
    });
  };

  useEffect(() => {
    if (initialQuestion && !asked.current) {
      asked.current = true;
      send(initialQuestion);
    }
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const suggestions = focus ? PARCEL_SUGGESTIONS : GENERAL_SUGGESTIONS;

  return (
    <div
      role="dialog"
      aria-label="GeoFarmer AI assistant"
      className="fixed inset-0 z-50 flex flex-col bg-surface lg:inset-auto lg:right-6 lg:bottom-6 lg:h-[min(700px,calc(100dvh-3rem))] lg:w-[420px] lg:rounded-3xl lg:border-2 lg:border-line-strong lg:shadow-2xl"
    >
      <header className="flex items-start justify-between gap-3 border-b-[1.5px] border-line px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-extrabold">
            <Icon name="assistant" size={22} className="text-brand" /> GeoFarmer AI
          </p>
          <p className="text-xs text-muted">
            {focus ? `About parcel ${focus}` : "About all farms"} · answers only from GeoFarmer data
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close assistant" className="rounded-full p-1.5 hover:bg-surface-2">
          <Icon name="x" size={22} />
        </button>
      </header>

      <ol ref={listRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <li className="space-y-3">
            <p className="text-muted">
              Ask about crops, rotation, or where the data comes from. I explain GeoFarmer&apos;s results; I don&apos;t guess
              missing values.
            </p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-2xl border-[1.5px] border-line-strong px-4 py-2.5 text-left font-semibold hover:bg-surface-2"
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} onFollowUp={send} onLink={onClose} />
        ))}
        {pending && (
          <li className="flex items-center gap-2 text-muted" aria-live="polite">
            <Icon name="assistant" size={18} className="animate-pulse text-brand" /> Checking the data…
          </li>
        )}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t-[1.5px] border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <label className="sr-only" htmlFor="assistant-input">Your question</label>
        <input
          id="assistant-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="Ask GeoFarmer AI…"
          className="min-w-0 flex-1 rounded-full border-2 border-line-strong bg-surface px-4 py-3 outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          aria-label="Send"
          className="rounded-full bg-brand p-3 text-brand-ink disabled:opacity-50"
        >
          <Icon name="send" size={22} />
        </button>
      </form>
    </div>
  );
}
