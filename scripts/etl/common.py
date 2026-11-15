from __future__ import annotations

from pathlib import Path

import pandas as pd
import pyogrio

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "NASA SPACE APPS"
GDB = SRC / "GeoFarmer.gdb"
DATA_GDB = SRC / "GeoFarmer_Data.gdb"
CONTEXT_GDB = SRC / "MyProject2" / "MyProject2.gdb"
OUT = ROOT / "data" / "processed"
UTM = 32630

fixes: list[str] = []
gaps: list[str] = []


def read(gdb: Path, layer: str):
    return pyogrio.read_dataframe(gdb, layer=layer)


def snake(df: pd.DataFrame) -> pd.DataFrame:
    return df.rename(columns={c: c.lower() for c in df.columns})


def write_csv(df: pd.DataFrame, name: str) -> None:
    df.to_csv(OUT / "csv" / f"{name}.csv", index=False)


def write_geojson(gdf, name: str) -> None:
    path = OUT / "geojson" / f"{name}.geojson"
    path.unlink(missing_ok=True)
    gdf.to_crs(4326).to_file(path, driver="GeoJSON", COORDINATE_PRECISION=7)
