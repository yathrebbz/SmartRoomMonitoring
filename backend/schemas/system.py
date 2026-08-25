"""Schémas des routes système (état et configuration)."""

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    model_loaded: bool
    features: list[str]
    reference_available: bool


class ConfigResponse(BaseModel):
    defaults: dict[str, float]
    thresholds: dict[str, float]
    readings_per_hour: int
