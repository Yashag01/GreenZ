import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Manual initialization for tests
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

from main import app
client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_get_assets():
    response = client.get("/api/assets")
    assert response.status_code == 200
    # There should be assets seeded
    assets = response.json()
    assert isinstance(assets, list)

def test_get_priority_list():
    response = client.get("/api/priority-list")
    assert response.status_code == 200
    assets = response.json()
    assert isinstance(assets, list)
    if assets:
        # Check if sorted
        assert assets[0]["priority_score"] >= assets[-1]["priority_score"]

def test_get_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
