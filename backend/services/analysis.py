"""Cas d'usage : analyse d'un relevé et profil de consommation sur 24 h."""

from backend.core import config
from backend.ml.model import EnergyModel
from backend.schemas.analysis import PredictRequest, ProfilePoint, ProfileRequest, ProfileResponse
from backend.services import advice_engine


def analyze_reading(model: EnergyModel, payload: PredictRequest) -> dict:
    """Prédit la consommation du relevé puis applique les règles métier."""
    prediction = model.predict(payload.model_dump())

    return advice_engine.analyze_room(
        energy_wh=prediction,
        electricity_price=payload.electricity_price,
        financial_goal=payload.financial_goal,
        movement=payload.movement,
        voltage=payload.voltage,
        current=payload.current,
        max_current=payload.max_current,
    )


def build_daily_profile(model: EnergyModel, payload: ProfileRequest) -> ProfileResponse:
    """Consommation prédite pour chaque heure de la journée, capteurs constants."""
    context = payload.model_dump()
    predictions = model.predict_many([{**context, "hour": hour} for hour in range(24)])

    points = []
    for hour, prediction in enumerate(predictions):
        hourly_energy = prediction * config.READINGS_PER_HOUR
        points.append(
            ProfilePoint(
                hour=hour,
                prediction=round(prediction, 2),
                hourly_energy_wh=round(hourly_energy, 1),
                hourly_cost=advice_engine.calculate_cost(hourly_energy, payload.electricity_price),
            )
        )

    daily_energy = sum(point.hourly_energy_wh for point in points)
    peak_hour = max(range(24), key=predictions.__getitem__)
    lowest_hour = min(range(24), key=predictions.__getitem__)

    return ProfileResponse(
        points=points,
        daily_energy_wh=round(daily_energy, 1),
        daily_cost=advice_engine.calculate_cost(daily_energy, payload.electricity_price),
        peak_hour=peak_hour,
        peak_prediction=round(predictions[peak_hour], 2),
        lowest_hour=lowest_hour,
        lowest_prediction=round(predictions[lowest_hour], 2),
    )
