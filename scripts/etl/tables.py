from __future__ import annotations

import numpy as np
import pandas as pd

from .common import GDB, UTM, fixes, gaps, read, snake


def farmers() -> pd.DataFrame:
    df = snake(read(GDB, "Farmers"))
    df = df.rename(columns={"years_of_expirience": "years_of_experience"})
    fixes.append("Farmers: renamed misspelt column `Years_of_Expirience` → `years_of_experience`.")
    df["is_simulated"] = True
    return df


def crop_reference() -> pd.DataFrame:
    df = snake(read(GDB, "Crop_Refrence"))
    fixes.append("Crop_Reference: source layer is misspelt `Crop_Refrence`; exported as `crop_reference`.")
    dup = df[df.crop_id.duplicated(keep=False)]
    if not dup.empty:
        mask = (df.crop_name == "Cowpea") & (df.crop_id == "C001")
        if mask.any() and "C002" not in set(df.crop_id):
            df.loc[mask, "crop_id"] = "C002"
            fixes.append("Crop_Reference: Cowpea had duplicate Crop_ID `C001` (same as Maize); reassigned to unused `C002`.")
    maize = df[df.crop_name == "Maize"].iloc[0]
    if maize.optimal_temp_min_c >= 30:
        gaps.append(
            f"Crop_Reference: Maize optimal temperature is {maize.optimal_temp_min_c:g}–{maize.optimal_temp_max_c:g} °C, "
            "which looks too high (FAO ECOCROP optimum is roughly 18–33 °C). Left unchanged; please confirm with agronomy."
        )
    assert not df.crop_id.duplicated().any()
    return df


def crop_seasons(crop_ids: set[str]) -> pd.DataFrame:
    df = snake(read(GDB, "Crop_Seasons"))
    missing = df.season_id.isna()
    if missing.any():
        df.loc[missing, "season_id"] = [f"S{i:03d}" for i in range(1, missing.sum() + 1)]
        fixes.append(f"Crop_Seasons: {missing.sum()} record(s) had no Season_ID; assigned sequential IDs (S001…).")
    for col in ("planting_date", "expected_harvest_date", "actual_harvest_date"):
        df[col] = pd.to_datetime(df[col], utc=True).dt.date
    fixes.append("Crop_Seasons: date-times truncated to dates (planting/harvest are calendar dates).")
    bad = set(df.crop_id) - crop_ids
    if bad:
        gaps.append(f"Crop_Seasons: unknown Crop_ID(s) {sorted(bad)}.")
    df["is_simulated"] = True
    return df


def farm_parcels(farmer_ids: set[str]):
    gdf = read(GDB, "Farm__Parcels")
    gdf = gdf.drop(columns=["id", "Shape_Length", "Shape_Area"])
    gdf = snake(gdf).set_geometry("geometry")
    utm = gdf.to_crs(UTM)
    computed = (utm.geometry.area / 10_000).round(2)
    had = gdf.farm_area_ha.notna().sum()
    diff = (gdf.farm_area_ha - computed).abs().max()
    gdf["farm_area_ha"] = computed
    fixes.append(
        f"Farm_Parcels: Farm_Area_ha was filled for only {had}/{len(gdf)} parcels; recomputed for all from geometry "
        f"in UTM 30N (max difference vs. existing values: {diff:.2f} ha)."
    )
    centroids = utm.geometry.centroid.to_crs(4326)
    gdf["centroid_lon"] = centroids.x.round(6)
    gdf["centroid_lat"] = centroids.y.round(6)
    empty = gdf.geometry.is_empty
    gdf["has_geometry"] = ~empty
    gdf.loc[empty, ["farm_area_ha", "centroid_lon", "centroid_lat"]] = np.nan
    if empty.any():
        gaps.append(f"Farm_Parcels: {', '.join(gdf.parcel_id[empty])} have EMPTY geometries (no polygon was digitised). "
                    "Kept as records with has_geometry=false; excluded from the map and spatial statistics.")
    unassigned = gdf.farmer_id.isna().sum()
    gaps.append(f"Farm_Parcels: {unassigned}/{len(gdf)} parcels have no Farmer_ID (only {len(gdf) - unassigned} are linked). Left empty, not invented.")
    bad = set(gdf.farmer_id.dropna()) - farmer_ids
    if bad:
        gaps.append(f"Farm_Parcels: Farmer_ID(s) {sorted(bad)} not found in Farmers.")
    for col in ("soil_type", "irrigation_status", "farm_status", "remarks"):
        if gdf[col].isna().all():
            gaps.append(f"Farm_Parcels: `{col}` is empty for every parcel.")
    gdf["is_simulated"] = True
    assert gdf.parcel_id.is_unique and gdf.geometry.is_valid.all()
    return gdf
