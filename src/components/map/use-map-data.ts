"use client";

import type { MapData } from "@/lib/map-data";

let request: Promise<MapData | null> | null = null;

export function mapData(): Promise<MapData | null> {
  request ??= fetch("/api/map")
    .then((r) => (r.ok ? (r.json() as Promise<MapData>) : null))
    .catch(() => null)
    .then((d) => {
      if (!d) request = null;
      return d;
    });
  return request;
}

if (typeof window !== "undefined") void mapData();

let webgl: boolean | undefined;

export function webglSupported(): boolean {
  if (webgl === undefined) {
    try {
      const gl = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
      webgl = Boolean(gl);
      (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
