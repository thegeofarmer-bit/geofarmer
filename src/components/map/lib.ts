export const mapLib =
  typeof window === "undefined"
    ? undefined
    : import("maplibre-gl").then((m) => {
        m.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        return m;
      });
