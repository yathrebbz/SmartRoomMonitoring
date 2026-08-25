"""Couche HTTP : assemble les routeurs sous le préfixe ``/api``."""

from fastapi import APIRouter

from backend.api.routes import analysis, reference, system

api_router = APIRouter(prefix="/api")
api_router.include_router(system.router)
api_router.include_router(analysis.router)
api_router.include_router(reference.router)
