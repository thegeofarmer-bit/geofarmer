"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { AssistantPanel } from "./assistant-panel";
import { OPEN_ASSISTANT_EVENT } from "./open-assistant";

function useParcelInView() {
  const pathname = usePathname();
  const params = useSearchParams();
  return pathname.match(/^\/parcel\/(P\d+)/)?.[1] ?? (pathname === "/map" ? params.get("parcel") : null);
}

export function AssistantLauncher() {
  const parcelId = useParcelInView();
  const [open, setOpen] = useState<{ question?: string; session: number } | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const question = (e as CustomEvent<{ question?: string }>).detail?.question;
      setOpen({ question, session: Date.now() });
    };
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
  }, []);

  if (open) {
    return (
      <AssistantPanel
        key={`${open.session}-${parcelId ?? "all"}`}
        parcelId={parcelId}
        initialQuestion={open.question}
        onClose={() => setOpen(null)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen({ session: Date.now() })}
      className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-2 rounded-full bg-brand py-3 pr-5 pl-4 font-bold text-brand-ink shadow-lg ring-4 ring-brand/20 lg:right-6 lg:bottom-6"
    >
      <Icon name="assistant" size={22} />
      Ask GeoFarmer AI
    </button>
  );
}
