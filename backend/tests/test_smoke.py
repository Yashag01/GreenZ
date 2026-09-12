import pytest
from fastapi.testclient import TestClient
from backend.main import app
import time

client = TestClient(app)

# Wait a moment for background thread to load cache during tests
time.sleep(2)

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
