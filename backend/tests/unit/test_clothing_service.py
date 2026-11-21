"""Pruebas unitarias del servicio del armario virtual."""

from unittest.mock import AsyncMock

import pytest

from backend.app.schemas.clothing import ClothingCreate
from backend.app.services.clothing_service import ClothingService


@pytest.mark.asyncio
async def test_create_clothing():
    repository = AsyncMock()

    async def save_clothing(document):
        return {"_id": "507f1f77bcf86cd799439011", **document}

    repository.create.side_effect = save_clothing
    service = ClothingService(repository=repository)

    data = ClothingCreate(
        name="Camiseta azul",
        category="camiseta",
        color="azul",
        size="M",
    )

    result = await service.create("usuario123", data)

    assert result["name"] == "Camiseta azul"
    assert result["owner_id"] == "usuario123"
    assert result["category"] == "camiseta"
    assert result["id"] == "507f1f77bcf86cd799439011"


@pytest.mark.asyncio
async def test_list_clothing_by_owner():
    repository = AsyncMock()
    repository.find_by_owner.return_value = []
    service = ClothingService(repository=repository)

    result = await service.list_by_owner("usuario123")

    assert result == []
    repository.find_by_owner.assert_awaited_once_with("usuario123")


@pytest.mark.asyncio
async def test_delete_clothing_by_owner():
    repository = AsyncMock()
    repository.delete.return_value = True
    service = ClothingService(repository=repository)

    result = await service.delete("prenda123", "usuario123")

    assert result is True
    repository.delete.assert_awaited_once_with("prenda123", "usuario123")
