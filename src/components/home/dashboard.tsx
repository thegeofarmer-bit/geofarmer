import { getCrops, getDatasets, getFarmers, getParcels, getVariableByParcel } from "@/lib/data";
import { CropsOnFarms } from "./crops-on-farms";
import { DataSources } from "./data-sources";
import { EnvironmentSummary } from "./environment-summary";
import { StatGrid } from "./stat-grid";

export async function Dashboard() {
  const [parcels, farmers, crops, datasets, slope, elevation, sand] = await Promise.all([
    getParcels(),
    getFarmers(),
    getCrops(),
    getDatasets(),
    getVariableByParcel("mean_slope"),
    getVariableByParcel("mean_elevation"),
    getVariableByParcel("soil_sand"),
  ]);
  const mapped = parcels.filter((p) => p.has_geometry);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <StatGrid
        mapped={mapped.length}
        total={parcels.length}
        areaHa={mapped.reduce((s, p) => s + Number(p.farm_area_ha ?? 0), 0)}
        farmers={farmers.length}
        cropTypes={crops.length}
      />
      <CropsOnFarms parcels={parcels} />
      <EnvironmentSummary
        items={[
          { label: "Mean slope", unit: "°", digits: 1, values: slope },
          { label: "Mean elevation", unit: "m", digits: 0, values: elevation },
          { label: "Mean sand", unit: "%", digits: 1, values: sand },
        ]}
      />
      <DataSources datasets={datasets} />
    </div>
  );
}
