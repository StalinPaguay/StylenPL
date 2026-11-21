"""Pruebas unitarias del servicio de intercambios."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest
from bson import ObjectId

from backend.app.schemas.exchange import ExchangeCreate
from backend.app.services.exchange_service import ExchangeService


@pytest.fixture
def service():
    repository = AsyncMock()
    clothing_repository = AsyncMock()
    return ExchangeService(
        repository=repository,
        clothing_repository=clothing_repository,
    )


@pytest.mark.asyncio
async def test_create_exchange_with_own_clothing(service):
    clothing_id = str(ObjectId())
    owner_id = str(ObjectId())
    data = ExchangeCreate(
        clothing_id=clothing_id,
        title="Chaqueta para intercambio",
        description="Chaqueta en excelente estado.",
    )

    service.clothing_repository.find_by_id_and_owner.return_value = {
        "_id": ObjectId(clothing_id)
    }

    async def save(document):
        return {"_id": ObjectId(), **document}

    service.repository.create.side_effect = save

    result = await service.create(owner_id, data)

    assert result["owner_id"] == owner_id
    assert result["status"] == "disponible"
    assert result["clothing_id"] == clothing_id


@pytest.mark.asyncio
async def test_reject_exchange_of_another_users_clothing(service):
    data = ExchangeCreate(
        clothing_id=str(ObjectId()),
        title="Prenda para intercambio",
        description="Prenda en excelente estado.",
    )
    service.clothing_repository.find_by_id_and_owner.return_value = None

    with pytest.raises(ValueError):
        await service.create(str(ObjectId()), data)

    service.repository.create.assert_not_awaited()


@pytest.mark.asyncio
async def test_list_available_exchanges(service):
    service.repository.find_available.return_value = [
        {
            "_id": ObjectId(),
            "owner_id": str(ObjectId()),
            "clothing_id": str(ObjectId()),
            "title": "Chaqueta disponible",
            "description": "Chaqueta en excelente estado.",
            "status": "disponible",
            "created_at": datetime.now(timezone.utc),
        }
    ]

    result = await service.list_available()

    assert len(result) == 1
    assert result[0]["status"] == "disponible"


@pytest.mark.asyncio
async def test_delete_own_exchange(service):
    service.repository.delete.return_value = True

    result = await service.delete(str(ObjectId()), str(ObjectId()))

    assert result is True
    service.repository.delete.assert_awaited_once()
