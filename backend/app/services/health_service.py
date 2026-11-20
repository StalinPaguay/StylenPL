"""Servicio para consultar el estado de la API."""


async def get_health_status() -> dict[str, str]:
    return {"status": "ok"}
