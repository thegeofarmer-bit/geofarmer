from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import rasterio
from rasterstats import zonal_stats

from .common import DATA_GDB, GDB, SRC, fixes, gaps, read, snake
from .soil_relative import add_relative_soil


def raster_zonal(gdf, raster: Path, stats: str):
    with rasterio.open(raster) as src:
        zones = gdf[~gdf.geometry.is_empty].to_crs(src.crs)
        arr = src.read(1, masked=True)
        return zonal_stats(list(zones.geometry), arr.astype("float64").filled(np.nan), affine=src.transform,
                           nodata=np.nan, stats=stats, all_touched=True)


def environment(parcels) -> tuple[pd.DataFrame, pd.DataFrame]:
    rows: list[dict] = []

    def add(pid, variable, value, unit, dataset_id, method):
        if value is None or (isinstance(value, float) and np.isnan(value)):
            return
        rows.append(dict(parcel_id=pid, variable=variable, value=round(float(value), 4), unit=unit,
                         dataset_id=dataset_id, method=method))

    zs = read(GDB, "ZS_Sand")
    for r in zs.itertuples():
        add(r.Parcel_ID, "soil_sand", r.MEAN / 10, "%", "DS_SOILGRIDS", "zonal mean (ArcGIS ZS_Sand)")
    fixes.append("Soil sand: SoilGrids values were stored in g/kg (e.g. 586); converted to % (58.6).")
    no_sand = sorted(set(parcels.parcel_id) - set(zs.Parcel_ID))
    if no_sand:
        gaps.append(f"Soil sand: missing for {', '.join(no_sand)} (these parcels have empty geometries).")

    add_relative_soil(parcels, add)

    for variable, raster, unit in (("elevation", SRC / "dem", "m"), ("slope", SRC / "slope", "degrees")):
        mapped = parcels[parcels.has_geometry]
        for pid, s in zip(mapped.parcel_id, raster_zonal(parcels, raster, "mean min max")):
            add(pid, f"mean_{variable}", s["mean"], unit, "DS_SRTM", "zonal mean (all touched cells)")
            add(pid, f"max_{variable}", s["max"], unit, "DS_SRTM", "zonal max (all touched cells)")
        fixes.append(f"{variable.title()}: computed per-parcel mean/max from `{raster.name}` raster (was empty in Parcel_Environmental).")

    moist = snake(read(DATA_GDB, "Moisture_Class_Long"))
    moist["label"] = moist.label.astype(int)
    moist["cell_count"] = moist.cell_count.astype(int)
    dominant = moist.loc[moist.groupby("parcel_id").class_percent.idxmax()]
    for r in dominant.itertuples():
        add(r.parcel_id, "dominant_moisture_class", r.label, "class", "DS_MOISTURE_CLASS", "class with highest % of parcel")
    no_moist = sorted(set(parcels.parcel_id) - set(moist.parcel_id))
    if no_moist:
        gaps.append(f"Moisture class: missing for {', '.join(no_moist)}.")
    gaps.append("Moisture class: labels 0–5 have no documented meaning (dry→wet?) or source raster. Needed before using it in scoring.")

    with rasterio.open(SRC / "flow_accu") as src:
        fmax = float(src.read(1, masked=True).max())
    if fmax < 100:
        gaps.append(
            f"Flow accumulation: the `flow_accu` raster tops out at {fmax:g} cells over a full SRTM tile, which suggests "
            "it was run on an unfilled DEM. Not used; re-run Fill → Flow Direction → Flow Accumulation."
        )

    original = read(GDB, "Parcel_Environmental")
    empty = [c for c in original.columns if original[c].isna().all()]
    gaps.append(
        "Parcel_Environmental: these columns are empty for every parcel and have no source data here: "
        + ", ".join(f"`{c}`" for c in empty)
        + ". Rainfall (GPM) and soil (SoilGrids pH/texture/SOC/N) rasters must be supplied."
    )
    fixes.append("Parcel_Environmental: converted from wide (one column per variable) to long format "
                 "(parcel_id, variable, value, unit, dataset_id). Missing values simply have no row.")

    long = pd.DataFrame(rows).sort_values(["parcel_id", "variable"])
    long.insert(0, "environment_id", [f"ENV{i:05d}" for i in range(1, len(long) + 1)])
    moist_out = moist[["parcel_id", "label", "cell_count", "total_cells", "class_percent"]].rename(
        columns={"label": "moisture_class"})
    moist_out["class_percent"] = moist_out.class_percent.round(3)
    return long, moist_out
