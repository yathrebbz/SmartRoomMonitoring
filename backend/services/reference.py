"""Profil horaire de référence calculé sur le dataset d'origine."""

import logging

import pandas as pd

from backend.core import config

logger = logging.getLogger(__name__)


def load_hourly_reference(path=config.DATASET_PATH):
    """Consommation moyenne / médiane / P90 par heure (Wh sur 10 min), ou ``[]`` sans dataset."""
    if not path.exists():
        logger.warning("Dataset introuvable (%s) : profil de référence désactivé.", path)
        return []

    df = pd.read_csv(path, usecols=["date", "Appliances"])
    hours = pd.to_datetime(df["date"]).dt.hour
    grouped = df["Appliances"].groupby(hours)

    stats = pd.DataFrame(
        {
            "mean": grouped.mean(),
            "median": grouped.median(),
            "p90": grouped.quantile(0.9),
        }
    )

    return [
        {
            "hour": int(hour),
            "mean": round(float(row["mean"]), 1),
            "median": round(float(row["median"]), 1),
            "p90": round(float(row["p90"]), 1),
        }
        for hour, row in stats.iterrows()
    ]
