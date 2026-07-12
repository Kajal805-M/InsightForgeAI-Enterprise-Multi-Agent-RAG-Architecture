from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify that the health check endpoint returns 200 OK."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_system_status():
    """Verify that the system status endpoint returns valid metrics."""
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert "latency_ms" in data
    assert "status" in data
    assert data["status"] == "operational"
    assert "total_documents" in data
