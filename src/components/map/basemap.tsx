"use client";

import { useSyncExternalStore } from "react";
import type { StyleSpecification } from "maplibre-gl";

export type Basemap = "satellite" | "plain";

const KEY = "geofarmer:basemap";
const EVENT = "geofarmer:basemap";
let memory: Basemap = "satellite";

function read(): Basemap {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "plain" || saved === "satellite" ? saved : memory;
  } catch {
    return memory;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useBasemap() {
  const basemap = useSyncExternalStore(subscribe, read, () => "satellite" as Basemap);
  const choose = (b: Basemap) => {
    memory = b;
    try {
      localStorage.setItem(KEY, b);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  };
  return [basemap, choose] as const;
}

export function baseStyle(basemap: Basemap, bg: string): StyleSpecification {
  if (basemap === "plain") {
    return { version: 8, sources: {}, layers: [{ id: "bg", type: "background", paint: { "background-color": bg } }] };
  }
  return {
    version: 8,
    sources: {
      satellite: {
        type: "raster",
        tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
        tileSize: 256,
        maxzoom: 19,
        attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
      },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#2b2a24" } },
      { id: "satellite", type: "raster", source: "satellite" },
    ],
  };
}

export function BasemapToggle({ value, onChange, className = "" }: { value: Basemap; onChange: (b: Basemap) => void; className?: string }) {
  const option = (b: Basemap, label: string) => (
    <button
      type="button"
      aria-pressed={value === b}
      onClick={() => onChange(b)}
      className={`px-4 py-2 font-semibold ${value === b ? "bg-brand text-brand-ink" : "bg-surface"}`}
    >
      {label}
    </button>
  );
  return (
    <div className={`pointer-events-auto flex shrink-0 overflow-hidden rounded-full border-2 border-line-strong shadow-sm ${className}`}>
      {option("satellite", "Satellite")}
      {option("plain", "Map")}
    </div>
  );
}
