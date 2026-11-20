"""Pruebas de integración del endpoint de salud."""

from fastapi.testclient import TestClient

from backend.app.main import app


def test_health_check():
    response = TestClient(app).get("/health/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
