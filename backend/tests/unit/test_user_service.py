"""Pruebas unitarias del servicio de usuarios."""

from unittest.mock import AsyncMock

import pytest

from backend.app.schemas.user import UserCreate
from backend.app.services.user_service import UserService


@pytest.mark.asyncio
async def test_register_user():
    repository = AsyncMock()
    repository.find_by_email.return_value = None

    async def create_user(document):
        return {"_id": "507f1f77bcf86cd799439011", **document}

    repository.create.side_effect = create_user

    service = UserService(repository=repository)
    data = UserCreate(
        name="Usuario Prueba",
        email="usuario@example.com",
        password="ClaveSegura123!",
    )

    result = await service.register(data)

    assert result["name"] == "Usuario Prueba"
    assert result["email"] == "usuario@example.com"
    assert "password" not in result
    assert "hashed_password" not in result

    saved = repository.create.call_args.args[0]
    assert saved["hashed_password"] != data.password


@pytest.mark.asyncio
async def test_register_duplicate_email():
    repository = AsyncMock()
    repository.find_by_email.return_value = {"email": "usuario@example.com"}

    service = UserService(repository=repository)
    data = UserCreate(
        name="Usuario Prueba",
        email="usuario@example.com",
        password="ClaveSegura123!",
    )

    with pytest.raises(ValueError, match="ya está registrado"):
        await service.register(data)

    repository.create.assert_not_called()
