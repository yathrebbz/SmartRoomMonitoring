"""Random Forest exporté par le notebook : chargement et prédiction de la consommation."""

import logging

import joblib
import pandas as pd

from backend.core import config

logger = logging.getLogger(__name__)


class EnergyModel:
    """Enveloppe le modèle scikit-learn et la liste ordonnée de ses variables."""

    def __init__(self, model, features):
        self.model = model
        self.features = list(features)

    @classmethod
    def load(cls, model_path=config.MODEL_PATH, features_path=config.MODEL_FEATURES_PATH):
        return cls(joblib.load(model_path), joblib.load(features_path))

    def predict_many(self, readings):
        """Prédit la consommation (Wh) de plusieurs dicts ``variable -> valeur``."""
        frame = pd.DataFrame(
            [[reading[feature] for feature in self.features] for reading in readings],
            columns=self.features,
        )
        # Une consommation ne peut pas être négative.
        return [max(0.0, float(value)) for value in self.model.predict(frame)]

    def predict(self, reading):
        return self.predict_many([reading])[0]


def load_energy_model(expected_features=None):
    """Charge le modèle exporté ; ``None`` s'il est absent, corrompu ou incompatible.

    ``expected_features`` : variables que l'API sait fournir ; un modèle qui en
    attend d'autres est refusé pour éviter des erreurs à chaque prédiction.
    """
    try:
        model = EnergyModel.load()
    except FileNotFoundError as exc:
        logger.error(
            "Modèle introuvable (%s). Exécutez notebooks/smart_room_modeling.ipynb "
            "pour l'exporter dans models/.",
            exc.filename or exc,
        )
        return None
    except Exception:  # noqa: BLE001 - un modèle corrompu ne doit pas empêcher le démarrage
        logger.exception("Erreur lors du chargement du modèle IA.")
        return None

    if expected_features is not None:
        unknown = set(model.features) - set(expected_features)
        if unknown:
            logger.error(
                "Le modèle attend des variables absentes du schéma de l'API : %s. "
                "Alignez backend/schemas/analysis.py avec le notebook.",
                ", ".join(sorted(unknown)),
            )
            return None

    logger.info("Modèle IA chargé. Variables : %s", ", ".join(model.features))
    return model
