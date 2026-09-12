import pandas as pd
from sqlalchemy.orm import Session
from .models import Asset, AssetHealth
import os

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")

def seed_database(db: Session, force=False):
    if not force and db.query(Asset).first():
        return # already seeded
        
    if force:
        db.query(AssetHealth).delete()
        db.query(Asset).delete()
        db.commit()

    solar_path = os.path.join(PROCESSED_DIR, "solar_clean.csv")
    wind_path = os.path.join(PROCESSED_DIR, "wind_clean.csv")
    
    assets = []
    if os.path.exists(solar_path):
        df_solar = pd.read_csv(solar_path)
        solar_ids = df_solar["asset_id"].unique()
        for i, aid in enumerate(solar_ids):
            # Try to cap at 15 for demo purposes
            if i >= 15:
                break
            # Find max power to use as capacity
            cap = df_solar[df_solar["asset_id"] == aid]["actual_power"].max()
            assets.append(Asset(
                id=aid,
                name=f"Solar Inverter {aid[-4:]}",
                type="solar",
                location="Plant 1 - Block A",
                capacity_kw=float(cap) * 1.1,
                criticality=0.6
            ))
            
    if os.path.exists(wind_path):
        df_wind = pd.read_csv(wind_path)
        wind_ids = df_wind["asset_id"].unique()
        for i, aid in enumerate(wind_ids):
            cap = df_wind[df_wind["asset_id"] == aid]["actual_power"].max()
            assets.append(Asset(
                id=aid,
                name=f"Wind Turbine {aid.split('-')[-1]}",
                type="wind",
                location="Wind Farm A",
                capacity_kw=float(cap),
                criticality=0.8 # Wind turbines are usually more critical/expensive
            ))
            
    for a in assets:
        db.add(a)
        db.add(AssetHealth(asset_id=a.id))
        
    db.commit()
