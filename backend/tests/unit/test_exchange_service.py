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

    service.repository.find_active_by_clothing.return_value = None
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
async def test_delete_own_exchange(service, monkeypatch):
    from unittest.mock import MagicMock

    from backend.app.database import mongodb
    from backend.app.repositories.exchange_request_repository import (
        ExchangeRequestRepository,
    )

    exchange_id = str(ObjectId())
    owner_id = str(ObjectId())

    service.repository.find_by_id.return_value = {
        "_id": ObjectId(exchange_id),
        "owner_id": owner_id,
        "status": "disponible",
    }
    service.repository.delete.return_value = True

    session = MagicMock()
    session.__aenter__ = AsyncMock(return_value=session)
    session.__aexit__ = AsyncMock(return_value=False)

    transaction = MagicMock()
    transaction.__aenter__ = AsyncMock(return_value=transaction)
    transaction.__aexit__ = AsyncMock(return_value=False)
    session.start_transaction.return_value = transaction

    client = MagicMock()
    client.start_session = AsyncMock(return_value=session)

    request_repository = MagicMock()
    request_repository.reject_pending_by_exchange = AsyncMock()

    monkeypatch.setattr(mongodb, "client", client)
    monkeypatch.setattr(
        ExchangeRequestRepository,
        "reject_pending_by_exchange",
        request_repository.reject_pending_by_exchange,
    )

    result = await service.delete(exchange_id, owner_id)

    assert result is True
    service.repository.delete.assert_awaited_once_with(
        exchange_id, owner_id, session=session
    )
    request_repository.reject_pending_by_exchange.assert_awaited_once_with(
        exchange_id, session=session
    )


@pytest.mark.asyncio
async def test_reject_duplicate_active_exchange(service):
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

    service.repository.find_active_by_clothing.return_value = {
        "_id": ObjectId(),
        "clothing_id": clothing_id,
        "owner_id": owner_id,
        "status": "disponible",
    }

    with pytest.raises(ValueError, match="ya tiene una"):
        await service.create(owner_id, data)

    service.repository.create.assert_not_awaited()


@pytest.mark.asyncio
async def test_update_exchange_status(service):
    exchange_id = str(ObjectId())
    owner_id = str(ObjectId())
    clothing_id = str(ObjectId())

    reserved_exchange = {
        "_id": ObjectId(exchange_id),
        "owner_id": owner_id,
        "clothing_id": clothing_id,
        "title": "Chaqueta para intercambio",
        "description": "Chaqueta en excelente estado.",
        "status": "reservado",
        "created_at": datetime.now(timezone.utc),
    }

    service.repository.find_by_id.return_value = reserved_exchange
    service.repository.complete_if_reserved.return_value = {
        **reserved_exchange,
        "status": "intercambiado",
    }

    result = await service.update_status(
        exchange_id, owner_id, "intercambiado"
    )

    assert result["id"] == exchange_id
    assert result["status"] == "intercambiado"

    service.repository.complete_if_reserved.assert_awaited_once_with(
        exchange_id, owner_id
    )

@pytest.mark.asyncio
async def test_update_status_of_nonexistent_exchange(service):
    exchange_id = str(ObjectId())
    owner_id = str(ObjectId())

    service.repository.find_by_id.return_value = None

    result = await service.update_status(
        exchange_id, owner_id, "intercambiado"
    )

    assert result is None
    service.repository.find_by_id.assert_awaited_once_with(exchange_id)
    service.repository.complete_if_reserved.assert_not_awaited()


@pytest.mark.asyncio
async def test_update_status_rejects_invalid_transition(service):
    exchange_id = str(ObjectId())
    owner_id = str(ObjectId())

    service.repository.find_by_id.return_value = {
        "_id": ObjectId(exchange_id),
        "owner_id": owner_id,
        "status": "disponible",
    }

    with pytest.raises(ValueError, match="Solo se puede finalizar"):
        await service.update_status(
            exchange_id, owner_id, "intercambiado"
        )

    service.repository.complete_if_reserved.assert_not_awaited()

@pytest.mark.asyncio
async def test_update_status_does_not_modify_other_users_exchange(service):
    exchange_id = str(ObjectId())
    actual_owner_id = str(ObjectId())
    other_user_id = str(ObjectId())

    service.repository.find_by_id.return_value = {
        "_id": ObjectId(exchange_id),
        "owner_id": actual_owner_id,
        "status": "reservado",
    }

    result = await service.update_status(
        exchange_id, other_user_id, "intercambiado"
    )

    assert result is None
    service.repository.find_by_id.assert_awaited_once_with(exchange_id)
    service.repository.complete_if_reserved.assert_not_awaited()
