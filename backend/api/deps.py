"""Dépendances FastAPI injectées dans les routes."""

from typing import Annotated

from fastapi import Depends, HTTPException, Request

from backend.ml.model import EnergyModel

MODEL_UNAVAILABLE = (
    "Le modèle IA n'est pas disponible. Exécutez le notebook "
    "notebooks/smart_room_modeling.ipynb puis redémarrez le serveur."
)


def get_energy_model(request: Request) -> EnergyModel:
    """Modèle chargé au démarrage ; 503 tant qu'il n'est pas disponible."""
    model = request.app.state.energy_model
    if model is None:
        raise HTTPException(status_code=503, detail=MODEL_UNAVAILABLE)
    return model


def get_optional_energy_model(request: Request) -> EnergyModel | None:
    return request.app.state.energy_model


def get_reference(request: Request) -> list[dict]:
    """Profil horaire de référence (liste vide si le dataset est absent)."""
    return request.app.state.reference


EnergyModelDep = Annotated[EnergyModel, Depends(get_energy_model)]
OptionalEnergyModelDep = Annotated[EnergyModel | None, Depends(get_optional_energy_model)]
ReferenceDep = Annotated[list[dict], Depends(get_reference)]
