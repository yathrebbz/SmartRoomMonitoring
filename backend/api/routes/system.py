"""Routes système : état du service et configuration exposée au frontend."""

from fastapi import APIRouter

from backend.api.deps import OptionalEnergyModelDep, ReferenceDep
from backend.core import config
from backend.schemas.system import ConfigResponse, HealthResponse

router = APIRouter(tags=["système"])


@router.get("/health", response_model=HealthResponse)
def health(model: OptionalEnergyModelDep, reference: ReferenceDep):
    return HealthResponse(
        status="ok",
        model_loaded=model is not None,
        features=model.features if model is not None else [],
        reference_available=bool(reference),
    )


@router.get("/config", response_model=ConfigResponse)
def get_config():
    """Valeurs par défaut et seuils, pour que le frontend affiche les mêmes limites que l'API."""
    return ConfigResponse(
        defaults={
            "electricity_price": config.DEFAULT_ELECTRICITY_PRICE,
            "financial_goal": config.DEFAULT_FINANCIAL_GOAL,
            "voltage": config.NOMINAL_VOLTAGE,
            "max_current": config.DEFAULT_MAX_CURRENT,
        },
        thresholds={
            "overvoltage": config.OVERVOLTAGE_THRESHOLD,
            "undervoltage": config.UNDERVOLTAGE_THRESHOLD,
            "current_warning_ratio": config.CURRENT_WARNING_RATIO,
            "budget_warning_ratio": config.BUDGET_WARNING_RATIO,
            "high_consumption_wh": config.HIGH_CONSUMPTION_WH,
            "idle_consumption_wh": config.IDLE_CONSUMPTION_WH,
        },
        readings_per_hour=config.READINGS_PER_HOUR,
    )
