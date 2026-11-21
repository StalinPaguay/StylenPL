"""Pruebas de integración con MongoDB."""

import pytest

from backend.app.database.mongodb import client, database


@pytest.mark.asyncio
async def test_mongodb_connection():
    result = await client.admin.command("ping")

    assert result["ok"] == 1
    assert database.name == "stylenpl"
