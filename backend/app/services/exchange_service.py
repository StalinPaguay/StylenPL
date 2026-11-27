"""Servicio de publicaciones de intercambio."""

import inspect
from datetime import datetime, timezone

from backend.app.repositories.clothing_repository import ClothingRepository
from backend.app.repositories.exchange_repository import ExchangeRepository


class ExchangeService:
    """LÃƒÂ³gica de negocio del mercado de intercambios."""

    def __init__(self, repository=None, clothing_repository=None):
        self.repository = repository if repository is not None else ExchangeRepository()
        self.clothing_repository = (
            clothing_repository
            if clothing_repository is not None
            else ClothingRepository()
        )

    @staticmethod
    def serialize(exchange: dict) -> dict:
        """Convertir un documento MongoDB en una respuesta pÃƒÂºblica."""
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
        """Publicar ÃƒÂºnicamente prendas pertenecientes al usuario."""
        clothing = await self.clothing_repository.find_by_id_and_owner(
            data.clothing_id, owner_id
        )

        if clothing is None:
            raise ValueError("La prenda no existe o no pertenece al usuario")

        existing = await self.repository.find_active_by_clothing(
            data.clothing_id, owner_id
        )

        if existing is not None:
            raise ValueError("La prenda ya tiene una publicaciÃ³n activa")

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
        """Consultar una publicaciÃ³n por identificador."""
        exchange = await self.repository.find_by_id(exchange_id)
        return self.serialize(exchange) if exchange else None

    async def delete(self, exchange_id: str, owner_id: str):
        """Eliminar ÃƒÂºnicamente publicaciones propias."""
        exchange = await self.repository.find_by_id(exchange_id)

        if exchange is None or exchange["owner_id"] != owner_id:
            return False

        if exchange["status"] != "disponible":
            raise ValueError(
                "No se puede eliminar una publicación reservada o intercambiada."
            )

        from backend.app.database.mongodb import client
        from backend.app.repositories.exchange_request_repository import (
            ExchangeRequestRepository,
        )

        request_repository = ExchangeRequestRepository()

        session = client.start_session()
        if inspect.isawaitable(session):
            session = await session
        async with session:
            transaction = session.start_transaction()
            if inspect.isawaitable(transaction):
                transaction = await transaction
            async with transaction:
                deleted = await self.repository.delete(
                    exchange_id, owner_id, session=session
                )

                if not deleted:
                    raise ValueError(
                        "La publicación ya no está disponible para eliminar."
                    )

                await request_repository.reject_pending_by_exchange(
                    exchange_id, session=session
                )

        return True

    async def update_status(self, exchange_id: str, owner_id: str, new_status: str):
        """Actualizar el estado de una publicaciÃ³n propia."""
        exchange = await self.repository.find_by_id(exchange_id)

        if exchange is None or exchange["owner_id"] != owner_id:
            return None

        if exchange["status"] != "reservado" or new_status != "intercambiado":
            raise ValueError(
                "Solo se puede finalizar una publicación que esté reservada."
            )

        exchange = await self.repository.complete_if_reserved(
            exchange_id, owner_id
        )

        if exchange is None:
            raise ValueError(
                "La publicación ya no está reservada o fue modificada."
            )

        return self.serialize(exchange) if exchange else None

    async def update(self, exchange_id: str, owner_id: str, data):
        """Editar el tÃ­tulo y la descripciÃ³n de una publicaciÃ³n propia."""
        changes = data.model_dump(exclude_unset=True)

        if any(value is None for value in changes.values()):
            raise ValueError("Los campos no pueden ser nulos")

        if "title" in changes:
            changes["title"] = changes["title"].strip()
            if not 5 <= len(changes["title"]) <= 120:
                raise ValueError("El tÃ­tulo debe tener entre 5 y 120 caracteres")

        if "description" in changes:
            changes["description"] = changes["description"].strip()
            if not 10 <= len(changes["description"]) <= 500:
                raise ValueError("La descripciÃ³n debe tener entre 10 y 500 caracteres")

        current = await self.repository.find_by_id(exchange_id)

        if current is None or current["owner_id"] != owner_id:
            return None

        if current["status"] != "disponible":
            raise ValueError(
                "No se puede editar una publicación reservada o intercambiada."
            )

        exchange = await self.repository.update(
            exchange_id, owner_id, changes
        )

        if exchange is None:
            raise ValueError(
                "La publicación cambió de estado durante la edición."
            )

        return self.serialize(exchange)
