from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from cache.analytics_store import store
from pipeline.orchestrator import run_pipeline
from routes.demo import notify_clients

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        # Read the uploaded file directly into a pandas DataFrame
        df = pd.read_csv(file.file)
        
        if "asset_id" not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain 'asset_id' column.")
            
        # Update the raw data store
        store.load_custom_csv(df)
        
        # Re-run pipeline for all assets present in the uploaded CSV
        affected_assets = df["asset_id"].unique()
        for asset_id in affected_assets:
            df_raw = store.get_raw(asset_id)
            if df_raw is not None and not df_raw.empty:
                df_processed = run_pipeline(asset_id, df_raw)
                store.update_processed(asset_id, df_processed)
            
        # Notify connected frontend clients via SSE
        notify_clients("asset_updated:batch_upload")
        
        return {"status": "success", "message": f"Successfully processed data for {len(affected_assets)} assets."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
