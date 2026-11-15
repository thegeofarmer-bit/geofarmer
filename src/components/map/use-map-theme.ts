"use client";

import { useEffect, useState } from "react";

export interface MapTheme {
  bg: string;
  road: string;
  river: string;
  ink: string;
  surface: string;
}

function readTheme(): MapTheme {
  const css = getComputedStyle(document.documentElement);
  const v = (n: string) => css.getPropertyValue(n).trim();
  return { bg: v("--map-bg"), road: v("--map-road"), river: v("--map-river"), ink: v("--ink"), surface: v("--surface") };
}

export function useMapTheme() {
  const [theme, setTheme] = useState<MapTheme | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setTheme(readTheme());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return theme;
}
