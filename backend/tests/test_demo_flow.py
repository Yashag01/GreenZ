import pytest
from fastapi.testclient import TestClient
from backend.main import app
import time

client = TestClient(app)
time.sleep(2) # Let background seed run

def test_demo_injection_flow():
    # 1. Reset
    resp = client.post("/api/demo/reset")
    assert resp.status_code == 200
    
    # 2. Get asset to verify it's normal
    # Just grab the first solar asset
    assets = client.get("/api/assets").json()
    if not assets:
        pytest.skip("No assets available")
        
    target_asset = assets[0]["id"]
    
    initial = client.get(f"/api/assets/{target_asset}").json()
    
    # 3. Inject fault
    resp = client.post("/api/demo/inject-fault", json={
        "asset_id": target_asset,
        "fault_type": "inverter_underperformance",
        "fault_magnitude": 0.4 # Huge drop
    })
    assert resp.status_code == 200
    
    # 4. Verify asset state changed
    updated = client.get(f"/api/assets/{target_asset}").json()
    
    assert updated["failure_risk"] > initial["failure_risk"]
    assert updated["priority_score"] > initial["priority_score"]
    
    # 5. Check alerts
    alerts = client.get("/api/alerts").json()
    assert any(target_asset in a["message"] or target_asset == a["asset_id"] for a in alerts)
    
    # 6. Reset again
    client.post("/api/demo/reset")
    restored = client.get(f"/api/assets/{target_asset}").json()
    assert restored["priority_score"] < updated["priority_score"]
