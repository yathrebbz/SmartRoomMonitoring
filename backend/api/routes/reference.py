"""Routes de référence : statistiques du dataset d'origine."""

from fastapi import APIRouter, HTTPException

from backend.api.deps import ReferenceDep
from backend.schemas.reference import HourlyReference

router = APIRouter(prefix="/reference", tags=["référence"])


@router.get("/hourly", response_model=list[HourlyReference])
def hourly_reference(reference: ReferenceDep):
    """Profil horaire du dataset d'origine (moyenne, médiane, P90 en Wh / 10 min)."""
    if not reference:
        raise HTTPException(status_code=404, detail="Profil de référence indisponible (dataset absent).")
    return reference
