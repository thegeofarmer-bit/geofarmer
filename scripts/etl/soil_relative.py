from __future__ import annotations

from pathlib import Path

import numpy as np
import rasterio
from rasterio.crs import CRS
from rasterstats import zonal_stats

from .common import ROOT, UTM, fixes, gaps

LAYERS = [
    ("soil_ph_relative", "soil_ph.tif", "soil pH"),
    ("soil_organic_carbon_relative", "Organic_carbon.tif", "organic carbon"),
    ("soil_nitrogen_relative", "nitrogen.tif", "soil nitrogen"),
]


def find(name: str) -> Path | None:
    for candidate in [ROOT / name, *ROOT.glob(f"drive-download-*/soil_maps/{name}")]:
        if candidate.exists():
            return candidate
    return None


def relative_index(path: Path, parcels) -> list[float | None]:
    with rasterio.open(path) as src:
        bands = src.read()
        grey = bands[0].astype("float64")
        grey[bands[3] == 0] = np.nan
        crs = src.crs or CRS.from_epsg(UTM)
        zones = parcels.to_crs(crs)
        stats = zonal_stats(list(zones.geometry), grey / 255 * 100, affine=src.transform,
                            nodata=np.nan, stats="mean", all_touched=True)
    return [s["mean"] for s in stats]


def add_relative_soil(parcels, add) -> None:
    mapped = parcels[parcels.has_geometry]
    for variable, filename, label in LAYERS:
        path = find(filename)
        if path is None:
            gaps.append(f"Relative {label}: `{filename}` not found.")
            continue
        means = relative_index(path, mapped)
        for pid, mean in zip(mapped.parcel_id, means):
            add(pid, variable, mean, "relative 0-100", "DS_SOIL_RELATIVE", "zonal mean of greyscale render")
        fixes.append(
            f"Relative {label}: extracted per-parcel position (0 = lowest, 100 = highest in the study area) "
            f"from the greyscale `{filename}`. Not a measured value; not used in scoring."
        )
    gaps.append(
        "Soil pH, organic carbon and nitrogen: the supplied TIFFs are rendered images, so only relative levels "
        "could be extracted. Re-export from ArcGIS with 'Use renderer' unchecked to get measured values."
    )
