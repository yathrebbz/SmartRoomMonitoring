"""Schémas de l'analyse d'un relevé et du profil journalier."""

from typing import Literal

from pydantic import BaseModel, Field

from backend.core import config

# ---------------------------------------------------------------------------
# Entrées
# ---------------------------------------------------------------------------


class SensorContext(BaseModel):
    """Capteurs de la pièce, hors heure (utilisés tels quels pour le profil 24 h)."""

    temperature: float = Field(description="Température intérieure (°C)", examples=[22])
    humidity: float = Field(ge=0, le=100, description="Humidité intérieure (%)", examples=[45])
    light_level: float = Field(ge=0, description="Niveau de lumière", examples=[40])
    pressure: float = Field(gt=0, description="Pression atmosphérique (mmHg)", examples=[733])
    outdoor_temperature: float = Field(description="Température extérieure (°C)", examples=[20])
    dewpoint: float = Field(description="Point de rosée (°C)", examples=[5])


class SensorReading(SensorContext):
    hour: int = Field(ge=0, le=23, description="Heure de la journée (0–23)", examples=[17])


class FinancialSettings(BaseModel):
    electricity_price: float = Field(
        default=config.DEFAULT_ELECTRICITY_PRICE, ge=0, description="Prix de l'électricité (TND/kWh)"
    )
    financial_goal: float = Field(
        default=config.DEFAULT_FINANCIAL_GOAL, ge=0, description="Objectif de coût par relevé (TND)"
    )


class ElectricalReading(BaseModel):
    movement: bool = Field(default=False, description="Mouvement détecté dans la pièce")
    voltage: float = Field(default=config.NOMINAL_VOLTAGE, ge=0, description="Tension (V)")
    current: float = Field(default=0.0, ge=0, description="Courant consommé (A)")
    max_current: float = Field(
        default=config.DEFAULT_MAX_CURRENT, gt=0, description="Courant maximal admissible (A)"
    )


class PredictRequest(SensorReading, FinancialSettings, ElectricalReading):
    """Analyse complète d'un relevé."""


class ProfileRequest(SensorContext, FinancialSettings):
    """Profil de consommation sur 24 h pour un état de la pièce donné."""


# ---------------------------------------------------------------------------
# Sorties
# ---------------------------------------------------------------------------

FinancialStatus = Literal["good", "warning", "budget_exceeded"]
MovementStatus = Literal["occupied", "empty"]
VoltageStatus = Literal["normal", "overvoltage", "undervoltage"]
LoadStatus = Literal["normal", "warning", "overload"]
AdviceLevel = Literal["info", "warning", "critical"]


class FinancialAnalysis(BaseModel):
    goal: float
    remaining_budget: float
    status: FinancialStatus
    message: str


class MovementAnalysis(BaseModel):
    detected: bool
    status: MovementStatus
    message: str


class VoltageAnalysis(BaseModel):
    value: float
    status: VoltageStatus
    message: str


class LoadAnalysis(BaseModel):
    current: float
    max_current: float
    status: LoadStatus
    message: str


class Advice(BaseModel):
    level: AdviceLevel
    text: str


class PredictResponse(BaseModel):
    prediction: float = Field(description="Consommation prédite (Wh sur 10 minutes)")
    cost: float = Field(description="Coût du relevé (TND)")
    financial: FinancialAnalysis
    movement: MovementAnalysis
    voltage: VoltageAnalysis
    load: LoadAnalysis
    advice: list[Advice]


class ProfilePoint(BaseModel):
    hour: int
    prediction: float = Field(description="Wh sur 10 minutes")
    hourly_energy_wh: float = Field(description="Énergie sur l'heure (6 relevés)")
    hourly_cost: float = Field(description="Coût de l'heure (TND)")


class ProfileResponse(BaseModel):
    points: list[ProfilePoint]
    daily_energy_wh: float
    daily_cost: float
    peak_hour: int
    peak_prediction: float
    lowest_hour: int
    lowest_prediction: float
