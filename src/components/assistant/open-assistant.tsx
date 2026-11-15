"use client";

import { Icon } from "@/components/ui/icon";

export const OPEN_ASSISTANT_EVENT = "geofarmer:open-assistant";

function openAssistant(question?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_ASSISTANT_EVENT, { detail: { question } }));
}

export function OpenAssistantButton({ question, label, className = "" }: { question?: string; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => openAssistant(question)}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-brand px-4 py-2 font-bold text-brand hover:bg-brand-soft ${className}`}
    >
      <Icon name="assistant" size={20} />
      {label}
    </button>
  );
}
