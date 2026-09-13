import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app
import time

from db.session import engine, Base, SessionLocal
from db.seed import seed_database
from cache.analytics_store import store
from db.models import Asset

Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database(db, force=True)
assets = db.query(Asset).all()
asset_ids = [a.id for a in assets]
store.load_from_disk(asset_ids)
for aid in asset_ids:
    df_raw = store.get_raw(aid)
    if df_raw is not None and not df_raw.empty:
        from pipeline.orchestrator import run_pipeline
        df_processed = run_pipeline(aid, df_raw)
        store.update_processed(aid, df_processed)
db.close()

client = TestClient(app)

def test_demo_injection_flow():
    resp = client.post("/api/demo/reset")
    assert resp.status_code == 200
    
    assets = client.get("/api/assets").json()
    if not assets:
        pytest.skip("No assets available")
        
    target_asset = assets[0]["id"]
    
    initial = client.get(f"/api/assets/{target_asset}").json()
    
    resp = client.post("/api/demo/inject-fault", json={
        "asset_id": target_asset,
        "fault_type": "inverter_underperformance",
        "fault_magnitude": 0.4 # Huge drop
    })
    assert resp.status_code == 200
    
    updated = client.get(f"/api/assets/{target_asset}").json()
    
    assert updated["failure_risk"] > initial["failure_risk"]
    assert updated["priority_score"] > initial["priority_score"]
    
    alerts = client.get("/api/alerts").json()
    assert any(target_asset in a["message"] or target_asset == a["asset_id"] for a in alerts)
    
    client.post("/api/demo/reset")
    restored = client.get(f"/api/assets/{target_asset}").json()
    assert restored["priority_score"] < updated["priority_score"]
