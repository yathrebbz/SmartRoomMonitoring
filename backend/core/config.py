"""Configuration du backend : chemins, seuils et valeurs par défaut."""

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Fichiers exportés par notebooks/smart_room_modeling.ipynb
MODELS_DIR = PROJECT_ROOT / "models"
MODEL_PATH = MODELS_DIR / "smart_room_energy_model.pkl"
MODEL_FEATURES_PATH = MODELS_DIR / "model_features.pkl"

# Dataset d'origine : sert au profil horaire de référence (optionnel).
DATASET_PATH = PROJECT_ROOT / "data" / "energydata_complete.csv"

# Origines autorisées à appeler l'API (frontend Vite en développement).
# Surchargeable : CORS_ORIGINS="http://monhote:5173,https://smartroom.example"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

# Une prédiction du modèle = énergie (Wh) consommée sur 10 minutes.
READINGS_PER_HOUR = 6

# Valeurs par défaut de l'API
DEFAULT_ELECTRICITY_PRICE = 0.3  # TND/kWh
DEFAULT_FINANCIAL_GOAL = 0.15  # TND
NOMINAL_VOLTAGE = 230.0  # V
DEFAULT_MAX_CURRENT = 10.0  # A

# Seuils de l'advice engine
OVERVOLTAGE_THRESHOLD = 253.0  # +10 % du nominal (EN 50160)
UNDERVOLTAGE_THRESHOLD = 207.0  # -10 % du nominal
CURRENT_WARNING_RATIO = 0.8
BUDGET_WARNING_RATIO = 0.8
HIGH_CONSUMPTION_WH = 500.0
IDLE_CONSUMPTION_WH = 300.0  # au-delà, une pièce vide déclenche un conseil
