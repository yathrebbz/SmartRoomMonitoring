"""Schémas Pydantic de l'API (validation des entrées, documentation OpenAPI)."""

from backend.schemas.analysis import (
    Advice,
    ElectricalReading,
    FinancialAnalysis,
    FinancialSettings,
    LoadAnalysis,
    MovementAnalysis,
    PredictRequest,
    PredictResponse,
    ProfilePoint,
    ProfileRequest,
    ProfileResponse,
    SensorContext,
    SensorReading,
    VoltageAnalysis,
)
from backend.schemas.reference import HourlyReference
from backend.schemas.system import ConfigResponse, HealthResponse

__all__ = [
    "Advice",
    "ConfigResponse",
    "ElectricalReading",
    "FinancialAnalysis",
    "FinancialSettings",
    "HealthResponse",
    "HourlyReference",
    "LoadAnalysis",
    "MovementAnalysis",
    "PredictRequest",
    "PredictResponse",
    "ProfilePoint",
    "ProfileRequest",
    "ProfileResponse",
    "SensorContext",
    "SensorReading",
    "VoltageAnalysis",
]
