"""Schémas du profil horaire de référence (dataset d'origine)."""

from pydantic import BaseModel, Field


class HourlyReference(BaseModel):
    hour: int = Field(ge=0, le=23)
    mean: float = Field(description="Consommation moyenne (Wh / 10 min)")
    median: float = Field(description="Consommation médiane (Wh / 10 min)")
    p90: float = Field(description="90e percentile (Wh / 10 min)")
