"""Routes d'analyse : prédiction d'un relevé et profil sur 24 h."""

from fastapi import APIRouter

from backend.api.deps import EnergyModelDep
from backend.schemas.analysis import PredictRequest, PredictResponse, ProfileRequest, ProfileResponse
from backend.services import analysis

router = APIRouter(tags=["analyse"])


@router.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest, model: EnergyModelDep):
    """Prédit la consommation d'un relevé et produit l'analyse complète (coût, budget, sécurité, conseils)."""
    return analysis.analyze_reading(model, payload)


@router.post("/profile", response_model=ProfileResponse)
def daily_profile(payload: ProfileRequest, model: EnergyModelDep):
    """Consommation prédite pour chaque heure de la journée, capteurs constants."""
    return analysis.build_daily_profile(model, payload)
