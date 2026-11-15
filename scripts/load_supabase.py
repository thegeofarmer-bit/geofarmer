from __future__ import annotations

import csv
import json
import os
from pathlib import Path

import psycopg

ROOT = Path(__file__).resolve().parents[1]
CSV = ROOT / "data" / "processed" / "csv"
GEOJSON = ROOT / "data" / "processed" / "geojson"
MOCK_FARMERS = next(ROOT.glob("drive-download-*/database/farmers_mock.csv"))

FARMER_ID_MAP = {"F001": "DEMO-F001", "F002": "DEMO-F002", "F003": "DEMO-F003"}
PLANTING_METHODS = {"Row Planting": "Rows", "Broadcast": "Broadcast", "Mounds": "Mounds", "Ridges": "Ridges"}


def env_url() -> str:
    if url := os.environ.get("DATABASE_URL"):
        return url
    for line in (ROOT / ".env.local").read_text().splitlines():
        if line.startswith("DATABASE_URL="):
            return line.split("=", 1)[1]
    raise SystemExit("DATABASE_URL not set")


def rows(name: str) -> list[dict]:
    with open(CSV / f"{name}.csv", newline="") as f:
        return [{k: (v if v != "" else None) for k, v in r.items()} for r in csv.DictReader(f)]


def yes(v: str | None) -> bool:
    return str(v).strip().lower() in ("yes", "true", "1")


def main() -> None:
    with psycopg.connect(env_url(), prepare_threshold=None) as conn, conn.cursor() as cur:
        for d in rows("datasets"):
            cur.execute(
                """insert into datasets values (%(dataset_id)s, %(name)s, %(source)s, %(is_simulated)s,
                   %(period_start)s, %(period_end)s, %(resolution_m)s, %(units)s, %(notes)s)
                   on conflict (dataset_id) do update set name=excluded.name, source=excluded.source,
                   is_simulated=excluded.is_simulated, period_start=excluded.period_start, period_end=excluded.period_end,
                   resolution_m=excluded.resolution_m, units=excluded.units, notes=excluded.notes""",
                {**d, "is_simulated": yes(d["is_simulated"])},
            )

        with open(MOCK_FARMERS, newline="") as f:
            for r in csv.DictReader(f):
                cur.execute(
                    """insert into farmers (farmer_id, farmer_name, community, preferred_crops, is_simulated)
                       values (%s, %s, %s, %s, true)
                       on conflict (farmer_id) do update set farmer_name=excluded.farmer_name,
                       community=excluded.community, preferred_crops=excluded.preferred_crops""",
                    (r["Farmer_ID"], r["Farmer_Name"], r["Community"], r["Preferred_Crops"]),
                )

        for c in rows("crop_reference"):
            cur.execute(
                """insert into crop_reference values (%(crop_id)s, %(crop_name)s, %(crop_family)s, %(crop_duration_days)s,
                   %(optimal_temp_min_c)s, %(optimal_temp_max_c)s, %(optimal_ph_min)s, %(optimal_ph_max)s,
                   %(water_requirement)s, %(drought_tolerance)s, %(nitrogen_fixing)s, %(nutrient_demand)s)
                   on conflict (crop_id) do update set crop_name=excluded.crop_name, crop_family=excluded.crop_family,
                   crop_duration_days=excluded.crop_duration_days, optimal_temp_min_c=excluded.optimal_temp_min_c,
                   optimal_temp_max_c=excluded.optimal_temp_max_c, optimal_ph_min=excluded.optimal_ph_min,
                   optimal_ph_max=excluded.optimal_ph_max, water_requirement=excluded.water_requirement,
                   drought_tolerance=excluded.drought_tolerance, nitrogen_fixing=excluded.nitrogen_fixing,
                   nutrient_demand=excluded.nutrient_demand""",
                {**c, "nitrogen_fixing": yes(c["nitrogen_fixing"])},
            )

        geoms = {
            f["properties"]["parcel_id"]: json.dumps(f["geometry"])
            for f in json.loads((GEOJSON / "farm_parcels.geojson").read_text())["features"]
        }
        for p in rows("farm_parcels"):
            cur.execute(
                """insert into farm_parcels (parcel_id, farmer_id, community, farm_area_ha, soil_type, irrigation_status,
                   farm_status, remarks, geom, is_simulated)
                   values (%(parcel_id)s, %(farmer_id)s, %(community)s, %(farm_area_ha)s, %(soil_type)s,
                   %(irrigation_status)s, %(farm_status)s, %(remarks)s,
                   extensions.st_multi(extensions.st_setsrid(extensions.st_geomfromgeojson(%(geom)s), 4326)), true)
                   on conflict (parcel_id) do update set community=excluded.community, farm_area_ha=excluded.farm_area_ha,
                   geom=excluded.geom""",
                {**p, "farmer_id": FARMER_ID_MAP.get(p["farmer_id"], p["farmer_id"]), "geom": geoms.get(p["parcel_id"])},
            )

        cur.execute("delete from parcel_environment where dataset_id <> 'DS_SIM_FARM'")
        cur.executemany(
            """insert into parcel_environment values (%(environment_id)s, %(parcel_id)s, %(variable)s, %(value)s,
               %(unit)s, %(dataset_id)s, %(method)s)""",
            rows("parcel_environment"),
        )
        cur.execute("delete from moisture_class_distribution")
        cur.executemany(
            """insert into moisture_class_distribution values (%(parcel_id)s, %(moisture_class)s, %(cell_count)s,
               %(total_cells)s::numeric::int, %(class_percent)s)""",
            rows("moisture_class_distribution"),
        )

        for s in rows("crop_seasons"):
            cur.execute(
                """insert into crop_seasons (season_id, parcel_id, crop_id, season_name, season_year, planting_date,
                   expected_harvest_date, actual_harvest_date, crop_variety, crop_status, planting_method, is_simulated)
                   values (%(season_id)s, %(parcel_id)s, %(crop_id)s, %(season_name)s,
                   extract(year from %(planting_date)s::date), %(planting_date)s, %(expected_harvest_date)s,
                   %(actual_harvest_date)s, %(crop_variety)s, %(crop_status)s, %(planting_method)s, true)
                   on conflict (season_id) do nothing""",
                {**s, "planting_method": PLANTING_METHODS.get(s["planting_method"], None)},
            )
        cur.execute("select setval('crop_season_seq', greatest((select count(*) from crop_seasons), 1))")

        counts = {}
        for t in ("datasets", "farmers", "crop_reference", "farm_parcels", "crop_seasons",
                  "parcel_environment", "moisture_class_distribution"):
            cur.execute(f"select count(*) from {t}")
            counts[t] = cur.fetchone()[0]
        cur.execute("select count(*) from farm_parcels where geom is null")
        counts["parcels_without_geometry"] = cur.fetchone()[0]
        print(json.dumps(counts, indent=2))


if __name__ == "__main__":
    main()
