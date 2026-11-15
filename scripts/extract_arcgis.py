from __future__ import annotations

import json

from etl.common import OUT, fixes, gaps, write_csv, write_geojson
from etl.datasets import DATASETS
from etl.environment import environment
from etl.outputs import cogs, context_layers, report
from etl.tables import crop_reference, crop_seasons, farm_parcels, farmers


def main() -> None:
    for d in ("csv", "geojson", "rasters"):
        (OUT / d).mkdir(parents=True, exist_ok=True)

    f = farmers()
    c = crop_reference()
    s = crop_seasons(set(c.crop_id))
    p = farm_parcels(set(f.farmer_id))
    env, moist = environment(p)
    wide = env.pivot(index="parcel_id", columns="variable", values="value").reindex(p.parcel_id).reset_index()

    write_csv(f, "farmers")
    write_csv(c, "crop_reference")
    write_csv(s, "crop_seasons")
    write_csv(p.drop(columns="geometry"), "farm_parcels")
    write_csv(env, "parcel_environment")
    write_csv(wide, "parcel_environment_wide")
    write_csv(moist, "moisture_class_distribution")
    write_csv(DATASETS, "datasets")
    write_geojson(p[p.has_geometry], "farm_parcels")
    context_layers()
    cogs()

    counts = {"csv/farmers.csv": len(f), "csv/crop_reference.csv": len(c), "csv/crop_seasons.csv": len(s),
              "csv/farm_parcels.csv + geojson/farm_parcels.geojson": len(p),
              "csv/parcel_environment.csv": len(env), "csv/moisture_class_distribution.csv": len(moist),
              "csv/datasets.csv": len(DATASETS)}
    report(counts)
    print(json.dumps(counts, indent=2))
    print(f"{len(fixes)} fixes, {len(gaps)} gaps → {OUT / 'REPORT.md'}")


if __name__ == "__main__":
    main()
