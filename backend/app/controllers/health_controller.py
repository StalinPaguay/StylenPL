"""Controlador del estado de la API."""

from backend.app.services.health_service import (
    get_health_status as get_service_health_status,
)


async def get_health_status() -> dict[str, str]:
    return await get_service_health_status()
