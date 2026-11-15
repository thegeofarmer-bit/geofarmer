type IconName = "ph" | "leaf" | "layers" | "drop" | "thermo" | "sprout" | "mountain" | "slope" | "soil";

export interface VariableDef {
  key: string;
  label: string;
  icon: IconName;
  unit: string;
  digits: number;
  scale?: { min: number; max: number; goodMin: number; goodMax: number };
  mapLayer?: boolean;
  ramp?: [string, string];
  relativeKey?: string;
}

export const VARIABLES: VariableDef[] = [
  { key: "soil_ph", label: "Soil pH", icon: "ph", unit: "", digits: 1,
    scale: { min: 4, max: 8.5, goodMin: 5.5, goodMax: 7 }, mapLayer: true, ramp: ["#f3d9a4", "#7a3e9d"],
    relativeKey: "soil_ph_relative" },
  { key: "soil_organic_carbon", label: "Organic carbon", icon: "leaf", unit: "%", digits: 1, mapLayer: true,
    ramp: ["#f1ead6", "#3d2a14"], relativeKey: "soil_organic_carbon_relative" },
  { key: "soil_sand", label: "Soil texture", icon: "layers", unit: "% sand", digits: 1, mapLayer: true,
    ramp: ["#efe2c4", "#a0602a"] },
  { key: "annual_rainfall_mm", label: "Rainfall", icon: "drop", unit: "mm/yr", digits: 0,
    scale: { min: 600, max: 1800, goodMin: 1000, goodMax: 1500 }, mapLayer: true, ramp: ["#e3eef3", "#155a7a"] },
  { key: "mean_temp_c", label: "Temperature", icon: "thermo", unit: "°C", digits: 1 },
  { key: "mean_ndvi", label: "NDVI", icon: "sprout", unit: "", digits: 2, mapLayer: true, ramp: ["#efe8cf", "#1f6b35"] },
  { key: "soil_nitrogen", label: "Soil nitrogen", icon: "soil", unit: "g/kg", digits: 2, mapLayer: true,
    ramp: ["#eef2dc", "#2f5d2a"], relativeKey: "soil_nitrogen_relative" },
  { key: "mean_slope", label: "Slope", icon: "slope", unit: "°", digits: 1,
    scale: { min: 0, max: 20, goodMin: 0, goodMax: 5 }, mapLayer: true, ramp: ["#e6efdc", "#8a3b12"] },
  { key: "mean_elevation", label: "Elevation", icon: "mountain", unit: "m", digits: 0, mapLayer: true,
    ramp: ["#e8f0e0", "#5b4a2f"] },
];

export const MAP_LAYERS = VARIABLES.filter((v) => v.mapLayer);

export function formatValue(value: number, def: VariableDef): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: def.digits,
    maximumFractionDigits: def.digits,
  });
}

export const MOISTURE_NOTE = "Class meanings (0–5) are not documented yet, so this is not used in scoring.";

export function relativeLevel(value: number): "Low" | "Medium" | "High" {
  return value < 100 / 3 ? "Low" : value < 200 / 3 ? "Medium" : "High";
}
