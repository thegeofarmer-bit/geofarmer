"use client";

import { useMemo, useSyncExternalStore } from "react";

export interface MapTheme {
  bg: string;
  road: string;
  river: string;
  ink: string;
  surface: string;
}

const VARS = ["--map-bg", "--map-road", "--map-river", "--ink", "--surface"] as const;

function snapshot(): string {
  const css = getComputedStyle(document.documentElement);
  return VARS.map((v) => css.getPropertyValue(v).trim()).join("|");
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useMapTheme(): MapTheme | null {
  const key = useSyncExternalStore(subscribe, snapshot, () => "");
  return useMemo(() => {
    if (!key) return null;
    const [bg, road, river, ink, surface] = key.split("|") as [string, string, string, string, string];
    return { bg, road, river, ink, surface };
  }, [key]);
}
