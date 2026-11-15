"use client";

import { useEffect, useState } from "react";
import type { MapData } from "@/lib/map-data";

let request: Promise<MapData> | null = null;

function load(): Promise<MapData> {
  request ??= fetch("/api/map").then((r) => {
    if (!r.ok) throw new Error(`Map data ${r.status}`);
    return r.json() as Promise<MapData>;
  });
  request.catch(() => {
    request = null;
  });
  return request;
}

export function useMapData() {
  const [state, setState] = useState<{ data?: MapData; error?: boolean }>({});
  useEffect(() => {
    let live = true;
    load().then(
      (data) => live && setState({ data }),
      () => live && setState({ error: true }),
    );
    return () => {
      live = false;
    };
  }, []);
  return state;
}

export function webglSupported(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}
