"""Pruebas unitarias del controlador de intercambios."""

from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from backend.app.controllers.exchange_controller import ExchangeController


@pytest.mark.asyncio
async def test_update_status_returns_404_when_exchange_not_found():
    service = AsyncMock()
    service.update_status.return_value = None
    controller = ExchangeController(service=service)

    with pytest.raises(HTTPException) as exc:
        await controller.update_status("exchange-id", "owner-id", "reservado")

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_update_status_returns_409_on_duplicate_conflict():
    service = AsyncMock()
    service.update_status.side_effect = ValueError(
        "La prenda ya tiene una publicación activa"
    )
    controller = ExchangeController(service=service)

    with pytest.raises(HTTPException) as exc:
        await controller.update_status("exchange-id", "owner-id", "disponible")

    assert exc.value.status_code == 409
