"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef } from "react";
import Map, { Layer, Marker, Source, type MapRef } from "react-map-gl/maplibre";
import type { FilterSpecification } from "maplibre-gl";
import { baseStyle, type Basemap } from "./basemap";
import { boundsOf, fillColor, toFeatures } from "./geo";
import type { MapLayerOption, MapParcel } from "./types";
import type { MapTheme } from "./use-map-theme";

export function MapCanvas({
  parcels,
  layer,
  selected,
  theme,
  basemap,
  onSelect,
}: {
  parcels: MapParcel[];
  layer?: MapLayerOption;
  selected: string | null;
  theme: MapTheme;
  basemap: Basemap;
  onSelect: (id: string | null) => void;
}) {
  const mapRef = useRef<MapRef>(null);
  const bounds = useMemo(() => boundsOf(parcels), [parcels]);
  const data = useMemo(() => toFeatures(parcels, layer), [parcels, layer]);
  const fill = useMemo(() => fillColor(layer), [layer]);
  const selectedParcel = parcels.find((p) => p.id === selected);
  const isSelected: FilterSpecification = ["==", ["get", "id"], selected ?? ""];

  useEffect(() => {
    const map = mapRef.current;
    if (!selectedParcel || !map) return;
    const [lng, lat] = selectedParcel.centroid;
    if (!map.getBounds().contains([lng, lat]) || map.getZoom() < 12) {
      map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13), duration: 800 });
    }
  }, [selectedParcel]);

  const style = useMemo(() => baseStyle(basemap, theme.bg), [basemap, theme.bg]);
  const sat = basemap === "satellite";
  const outline = sat ? "#fffdf7" : theme.ink;

  return (
    <Map
      ref={mapRef}
      reuseMaps
      dragRotate={false}
      touchPitch={false}
      maxPitch={0}
      fadeDuration={0}
      pixelRatio={typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2)}
      initialViewState={{ bounds, fitBoundsOptions: { padding: 40 } }}
      mapStyle={style}
      interactiveLayerIds={["parcels-fill"]}
      onClick={(e) => onSelect((e.features?.[0]?.properties?.id as string | undefined) ?? null)}
      cursor="pointer"
      attributionControl={{ compact: true, customAttribution: "Rivers, roads: GeoFarmer GIS team" }}
    >
      <Source id="rivers" type="geojson" data="/data/rivers.geojson">
        <Layer
          id="rivers"
          type="line"
          paint={{ "line-color": sat ? "#7cc8ee" : theme.river, "line-width": 3.5, "line-opacity": 0.9 }}
          layout={{ "line-cap": "round" }}
        />
      </Source>
      <Source id="roads" type="geojson" data="/data/roads.geojson">
        <Layer id="roads" type="line" paint={{ "line-color": sat ? "#f4efe4" : theme.road, "line-width": 2, "line-dasharray": [2, 1.5] }} />
      </Source>
      <Source id="parcels" type="geojson" data={data}>
        <Layer id="parcels-fill" type="fill" paint={{ "fill-color": fill, "fill-opacity": sat ? 0.5 : 0.92 }} />
        <Layer
          id="parcels-line"
          type="line"
          paint={{ "line-color": outline, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.6, 14, 1.8] }}
        />
        <Layer id="parcels-selected-halo" type="line" filter={isSelected} paint={{ "line-color": sat ? theme.ink : theme.surface, "line-width": 7 }} />
        <Layer id="parcels-selected" type="line" filter={isSelected} paint={{ "line-color": sat ? "#ffd166" : theme.ink, "line-width": 3 }} />
      </Source>
      {selectedParcel && (
        <Marker longitude={selectedParcel.centroid[0]} latitude={selectedParcel.centroid[1]} anchor="bottom" offset={[0, -14]}>
          <span className="pointer-events-none rounded-full bg-ink px-3 py-1 font-mono text-sm font-bold text-surface shadow">
            {selectedParcel.id}
          </span>
        </Marker>
      )}
    </Map>
  );
}
