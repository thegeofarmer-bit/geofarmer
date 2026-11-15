"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef } from "react";
import Map, { Layer, Marker, Source, type MapRef } from "react-map-gl/maplibre";
import type { FilterSpecification, StyleSpecification } from "maplibre-gl";
import { boundsOf, fillColor, toFeatures } from "./geo";
import { mapLib } from "./lib";
import type { MapLayerOption, MapParcel } from "./types";
import type { MapTheme } from "./use-map-theme";

export function MapCanvas({
  parcels,
  layer,
  selected,
  showLetters,
  theme,
  onSelect,
}: {
  parcels: MapParcel[];
  layer?: MapLayerOption;
  selected: string | null;
  showLetters: boolean;
  theme: MapTheme;
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

  const style: StyleSpecification = {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {},
    layers: [{ id: "bg", type: "background", paint: { "background-color": theme.bg } }],
  };

  return (
    <Map
      ref={mapRef}
      mapLib={mapLib}
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
          paint={{ "line-color": theme.river, "line-width": 3.5, "line-opacity": 0.9 }}
          layout={{ "line-cap": "round" }}
        />
      </Source>
      <Source id="roads" type="geojson" data="/data/roads.geojson">
        <Layer id="roads" type="line" paint={{ "line-color": theme.road, "line-width": 2, "line-dasharray": [2, 1.5] }} />
      </Source>
      <Source id="parcels" type="geojson" data={data}>
        <Layer id="parcels-fill" type="fill" paint={{ "fill-color": fill, "fill-opacity": 0.92 }} />
        <Layer
          id="parcels-line"
          type="line"
          paint={{ "line-color": theme.ink, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 14, 1.5] }}
        />
        <Layer id="parcels-selected-halo" type="line" filter={isSelected} paint={{ "line-color": theme.surface, "line-width": 7 }} />
        <Layer id="parcels-selected" type="line" filter={isSelected} paint={{ "line-color": theme.ink, "line-width": 3 }} />
        {showLetters && (
          <Layer
            id="parcels-letter"
            type="symbol"
            minzoom={12}
            layout={{ "text-field": ["get", "letter"], "text-font": ["Noto Sans Bold"], "text-size": 15 }}
            paint={{ "text-color": theme.ink, "text-halo-color": theme.surface, "text-halo-width": 3 }}
          />
        )}
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
