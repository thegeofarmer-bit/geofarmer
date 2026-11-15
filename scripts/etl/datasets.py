import pandas as pd

DATASETS = pd.DataFrame(
    [
        dict(dataset_id="DS_SIM_FARM", name="Simulated farm parcels and farmer records",
             source="GeoFarmer team (digitised, simulated)", is_simulated=True,
             period_start=None, period_end=None, resolution_m=None, units=None,
             notes="Prototype data; must be labelled as simulated in the UI."),
        dict(dataset_id="DS_SRTM", name="SRTM 1 arc-second DEM (tile N07W002)",
             source="NASA SRTM v3 via USGS", is_simulated=False,
             period_start="2000-02-11", period_end="2000-02-22", resolution_m=30, units="m",
             notes="Elevation and derived slope (degrees)."),
        dict(dataset_id="DS_SOILGRIDS", name="SoilGrids v2.0 sand content (0-5 cm)",
             source="ISRIC SoilGrids v2.0", is_simulated=False,
             period_start=None, period_end=None, resolution_m=250, units="%",
             notes="Converted from g/kg to %. Zonal mean per parcel computed in ArcGIS (ZS_Sand)."),
        dict(dataset_id="DS_SOIL_RELATIVE", name="Soil pH, organic carbon and nitrogen maps (relative)",
             source="GeoFarmer GIS team (greyscale renders of SoilGrids layers)", is_simulated=False,
             period_start=None, period_end=None, resolution_m=250, units="relative 0-100",
             notes="RELATIVE: position within each layer's own range in the study area, not a measured value."),
        dict(dataset_id="DS_MOISTURE_CLASS", name="Soil moisture class distribution",
             source="GeoFarmer GIS team (GeoFarmer_Data.gdb Moisture_Class_Long)", is_simulated=False,
             period_start=None, period_end=None, resolution_m=None, units="% of parcel",
             notes="Class labels 0-5; class meaning and source raster not documented."),
        dict(dataset_id="DS_GPM", name="NASA GPM IMERG rainfall",
             source="NASA GPM IMERG", is_simulated=False,
             period_start=None, period_end=None, resolution_m=None, units="mm",
             notes="NOT YET AVAILABLE: raster lives in nasa_space_challenge.gdb, which was not supplied."),
    ]
)
