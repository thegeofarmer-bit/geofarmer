"use client";

import { useSyncExternalStore } from "react";

let focused = false;
const listeners = new Set<() => void>();

export function setMapFocus(next: boolean) {
  if (focused === next) return;
  focused = next;
  if (next) document.documentElement.dataset.mapFocus = "";
  else delete document.documentElement.dataset.mapFocus;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useMapFocus = () => useSyncExternalStore(subscribe, () => focused, () => false);

const MOBILE = "(max-width: 1023.98px)";

const subscribeMobile = (l: () => void) => {
  const mq = window.matchMedia(MOBILE);
  mq.addEventListener("change", l);
  return () => mq.removeEventListener("change", l);
};

export const useIsMobile = () => useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE).matches, () => false);
