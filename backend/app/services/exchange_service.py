"""Servicio de publicaciones de intercambio."""

from datetime import datetime, timezone

from backend.app.repositories.clothing_repository import ClothingRepository
from backend.app.repositories.exchange_repository import ExchangeRepository


class ExchangeService:
    """Lógica de negocio del mercado de intercambios."""

    def __init__(self, repository=None, clothing_repository=None):
        self.repository = repository if repository is not None else ExchangeRepository()
        self.clothing_repository = (
            clothing_repository
            if clothing_repository is not None
            else ClothingRepository()
        )

    @staticmethod
    def serialize(exchange: dict) -> dict:
        """Convertir un documento MongoDB en una respuesta pública."""
        return {
            "id": str(exchange["_id"]),
            "owner_id": exchange["owner_id"],
            "clothing_id": exchange["clothing_id"],
            "title": exchange["title"],
            "description": exchange["description"],
            "status": exchange["status"],
            "created_at": exchange["created_at"],
        }

    async def create(self, owner_id: str, data):
        """Publicar únicamente prendas pertenecientes al usuario."""
        clothing = await self.clothing_repository.find_by_id_and_owner(
            data.clothing_id, owner_id
        )

        if clothing is None:
            raise ValueError("La prenda no existe o no pertenece al usuario")

        document = {
            **data.model_dump(),
            "owner_id": owner_id,
            "status": "disponible",
            "created_at": datetime.now(timezone.utc),
        }

        exchange = await self.repository.create(document)
        return self.serialize(exchange)

    async def list_available(self):
        """Consultar las publicaciones disponibles."""
        exchanges = await self.repository.find_available()
        return [self.serialize(item) for item in exchanges]

    async def list_by_owner(self, owner_id: str):
        """Consultar las publicaciones del usuario."""
        exchanges = await self.repository.find_by_owner(owner_id)
        return [self.serialize(item) for item in exchanges]

    async def get_by_id(self, exchange_id: str):
        """Consultar una publicación por identificador."""
        exchange = await self.repository.find_by_id(exchange_id)
        return self.serialize(exchange) if exchange else None

    async def delete(self, exchange_id: str, owner_id: str):
        """Eliminar únicamente publicaciones propias."""
        return await self.repository.delete(exchange_id, owner_id)
