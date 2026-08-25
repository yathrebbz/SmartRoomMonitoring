"""Fabrique de l'application FastAPI."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import api_router
from backend.core import config
from backend.ml.model import load_energy_model
from backend.schemas.analysis import SensorReading
from backend.services.reference import load_hourly_reference

if not logging.getLogger().handlers:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")


def create_app(energy_model=None, reference=None) -> FastAPI:
    """Construit l'application.

    ``energy_model`` et ``reference`` permettent d'injecter des données (tests) ;
    sinon le modèle est chargé depuis ``models/`` et le profil de référence
    calculé depuis ``data/``.
    """
    app = FastAPI(
        title="Smart Room AI API",
        version="2.0.0",
        description=(
            "Prédiction de la consommation énergétique d'une pièce à partir de ses "
            "capteurs (Random Forest), analyse financière et conseils."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.energy_model = (
        energy_model
        if energy_model is not None
        else load_energy_model(expected_features=SensorReading.model_fields)
    )
    app.state.reference = reference if reference is not None else load_hourly_reference()

    app.include_router(api_router)
    return app
