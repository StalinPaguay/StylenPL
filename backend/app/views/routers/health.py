"""Rutas para comprobar el estado de la API."""

from fastapi import APIRouter

from backend.app.controllers.health_controller import get_health_status

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/")
async def health_check() -> dict[str, str]:
    return await get_health_status()
