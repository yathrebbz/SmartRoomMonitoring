"""Doubles de test et données partagées par les tests de l'API."""

from fastapi.testclient import TestClient

from backend.main import create_app
from backend.ml.model import EnergyModel

FEATURES = [
    "hour",
    "temperature",
    "humidity",
    "light_level",
    "pressure",
    "outdoor_temperature",
    "dewpoint",
]

VALID_READING = {
    "hour": 17,
    "temperature": 22,
    "humidity": 45,
    "light_level": 40,
    "pressure": 733,
    "outdoor_temperature": 20,
    "dewpoint": 5,
}

FAKE_REFERENCE = [
    {"hour": hour, "mean": 90.0 + hour, "median": 60.0, "p90": 200.0} for hour in range(24)
]


class ConstantRegressor:
    """Modèle factice : renvoie toujours la même consommation."""

    def __init__(self, value):
        self.value = value

    def predict(self, X):
        return [self.value] * len(X)


def make_client(prediction=250.0, reference=()):
    model = EnergyModel(ConstantRegressor(prediction), FEATURES)
    return TestClient(create_app(energy_model=model, reference=list(reference)))


def error_fields(response):
    """Noms des champs en erreur dans une réponse 422."""
    return {detail["loc"][-1] for detail in response.json()["detail"]}
