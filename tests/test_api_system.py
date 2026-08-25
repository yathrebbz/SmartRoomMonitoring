from fastapi.testclient import TestClient

from backend.core import config
from backend.main import create_app
from backend.ml.model import EnergyModel
from tests.helpers import FAKE_REFERENCE, FEATURES, VALID_READING, ConstantRegressor, make_client


def test_health(client):
    body = client.get("/api/health").json()
    assert body == {
        "status": "ok",
        "model_loaded": True,
        "features": FEATURES,
        "reference_available": False,
    }


def test_openapi_docs_available(client):
    assert client.get("/docs").status_code == 200
    paths = client.get("/openapi.json").json()["paths"]
    assert {"/api/health", "/api/config", "/api/predict", "/api/profile", "/api/reference/hourly"} <= set(paths)


def test_config(client):
    body = client.get("/api/config").json()
    assert body["defaults"]["voltage"] == config.NOMINAL_VOLTAGE
    assert body["thresholds"]["overvoltage"] == config.OVERVOLTAGE_THRESHOLD
    assert body["readings_per_hour"] == config.READINGS_PER_HOUR


def test_reference_unavailable(client):
    response = client.get("/api/reference/hourly")
    assert response.status_code == 404


def test_reference_available():
    client = make_client(reference=FAKE_REFERENCE)
    assert client.get("/api/health").json()["reference_available"] is True

    body = client.get("/api/reference/hourly").json()
    assert len(body) == 24
    assert body[5] == {"hour": 5, "mean": 95.0, "median": 60.0, "p90": 200.0}


def test_app_starts_without_model(monkeypatch):
    def missing_model(*args, **kwargs):
        raise FileNotFoundError("models/smart_room_energy_model.pkl")

    monkeypatch.setattr(EnergyModel, "load", missing_model)

    client = TestClient(create_app(reference=[]))

    assert client.get("/api/health").json()["model_loaded"] is False

    response = client.post("/api/predict", json=VALID_READING)
    assert response.status_code == 503
    assert "notebook" in response.json()["detail"]

    payload = {k: v for k, v in VALID_READING.items() if k != "hour"}
    assert client.post("/api/profile", json=payload).status_code == 503


def test_app_rejects_model_with_unknown_features(monkeypatch):
    monkeypatch.setattr(
        EnergyModel,
        "load",
        lambda *args, **kwargs: EnergyModel(ConstantRegressor(1.0), ["hour", "co2_level"]),
    )

    client = TestClient(create_app(reference=[]))
    assert client.get("/api/health").json()["model_loaded"] is False
