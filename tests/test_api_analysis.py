import pytest

from backend.core import config
from tests.helpers import VALID_READING, error_fields, make_client


def test_predict_nominal(client):
    payload = {
        **VALID_READING,
        "electricity_price": 0.3,
        "financial_goal": 1.0,
        "movement": True,
        "voltage": 230,
        "current": 5,
        "max_current": 10,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200

    body = response.json()
    assert body["prediction"] == 250.0
    assert body["cost"] == pytest.approx(0.075)
    assert body["financial"]["status"] == "good"
    assert body["movement"]["detected"] is True
    assert body["voltage"]["status"] == "normal"
    assert body["load"]["status"] == "normal"
    assert body["advice"] == [{"level": "info", "text": "Tout fonctionne normalement. Continuez ainsi !"}]


def test_predict_uses_defaults_for_optional_fields(client):
    body = client.post("/api/predict", json=VALID_READING).json()
    assert body["financial"]["goal"] == config.DEFAULT_FINANCIAL_GOAL
    assert body["voltage"]["value"] == config.NOMINAL_VOLTAGE
    assert body["load"]["max_current"] == config.DEFAULT_MAX_CURRENT
    assert body["movement"]["detected"] is False


def test_predict_alerts_scenario(client):
    payload = {**VALID_READING, "financial_goal": 0.01, "movement": False, "voltage": 260, "current": 9}
    body = client.post("/api/predict", json=payload).json()
    assert body["financial"]["status"] == "budget_exceeded"
    assert body["voltage"]["status"] == "overvoltage"
    assert body["load"]["status"] == "warning"
    assert body["movement"]["status"] == "empty"
    assert [item["level"] for item in body["advice"]] == ["critical", "critical", "warning"]


def test_predict_negative_prediction_is_clamped():
    client = make_client(prediction=-40.0)
    body = client.post("/api/predict", json=VALID_READING).json()
    assert body["prediction"] == 0.0


def test_predict_missing_feature(client):
    payload = {k: v for k, v in VALID_READING.items() if k != "humidity"}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
    assert error_fields(response) == {"humidity"}


def test_predict_non_numeric_value(client):
    response = client.post("/api/predict", json={**VALID_READING, "temperature": "chaud"})
    assert response.status_code == 422
    assert error_fields(response) == {"temperature"}


def test_predict_out_of_bounds_values(client):
    response = client.post(
        "/api/predict", json={**VALID_READING, "hour": 25, "humidity": 140, "max_current": 0}
    )
    assert response.status_code == 422
    assert error_fields(response) == {"hour", "humidity", "max_current"}


def test_predict_requires_json(client):
    response = client.post("/api/predict", content="pas du json", headers={"Content-Type": "text/plain"})
    assert response.status_code == 422


def test_profile(client):
    payload = {k: v for k, v in VALID_READING.items() if k != "hour"}
    response = client.post("/api/profile", json={**payload, "electricity_price": 0.3})
    assert response.status_code == 200

    body = response.json()
    assert [point["hour"] for point in body["points"]] == list(range(24))
    assert body["points"][0]["prediction"] == 250.0
    assert body["points"][0]["hourly_energy_wh"] == 1500.0
    assert body["points"][0]["hourly_cost"] == pytest.approx(0.45)
    assert body["daily_energy_wh"] == 36000.0
    assert body["daily_cost"] == pytest.approx(10.8)
    assert body["peak_prediction"] == 250.0
    assert body["lowest_prediction"] == 250.0
