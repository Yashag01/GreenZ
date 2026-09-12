from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from cache.analytics_store import store
from pipeline.orchestrator import run_pipeline
from routes.demo import notify_clients
from db.session import get_db
from db.models import Asset, AssetHealth

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/csv")
async def upload_csv(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")
        
    dfs = []
    
    try:
        for file in files:
            if not file.filename.endswith(".csv"):
                continue
            
            try:
                df = pd.read_csv(file.file)
                if "asset_id" not in df.columns or "timestamp" not in df.columns:
                    continue
                dfs.append(df)
            except Exception:
                continue
            
        if not dfs:
            raise HTTPException(status_code=400, detail="No valid data to process.")
            
        merged_df = pd.concat(dfs, ignore_index=True)
        if "timestamp" in merged_df.columns and "asset_id" in merged_df.columns:
            merged_df.drop_duplicates(subset=["asset_id", "timestamp"], keep="last", inplace=True)
        store.load_custom_csv(merged_df)
        
        affected_assets = merged_df["asset_id"].unique()
        
        # Add new assets to database if they don't exist
        existing = {a.id for a in db.query(Asset).filter(Asset.id.in_(affected_assets)).all()}
        for asset_id in affected_assets:
            if asset_id not in existing:
                is_solar = "irradiance_wm2" in merged_df.columns
                cap = merged_df[merged_df["asset_id"] == asset_id]["actual_power"].max() * 1.1
                new_asset = Asset(
                    id=asset_id,
                    name=f"Custom Asset {asset_id}",
                    type="solar" if is_solar else "wind",
                    location="Custom Upload",
                    capacity_kw=float(cap) if not pd.isna(cap) else 100.0,
                    criticality=0.5
                )
                db.add(new_asset)
                db.add(AssetHealth(asset_id=asset_id))
        
        if len(affected_assets) > len(existing):
            db.commit()
            
        for asset_id in affected_assets:
            df_raw = store.get_raw(asset_id)
            if df_raw is not None and not df_raw.empty:
                df_processed = run_pipeline(asset_id, df_raw)
                store.update_processed(asset_id, df_processed)
            
        notify_clients("asset_updated:batch_upload")
        return {"status": "success", "message": f"Successfully processed {len(files)} file(s) for {len(affected_assets)} asset(s)."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
