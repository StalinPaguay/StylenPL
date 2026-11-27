from pymongo.errors import DuplicateKeyError, OperationFailure
"""Reglas de negocio para solicitudes de intercambio."""

import inspect
from datetime import datetime, timezone

from backend.app.repositories.exchange_repository import ExchangeRepository
from backend.app.repositories.exchange_request_repository import (
    ExchangeRequestRepository,
)


class ExchangeRequestService:
    def __init__(self, repository=None, exchange_repository=None):
        self.repository = repository if repository is not None else ExchangeRequestRepository()
        self.exchange_repository = (
            exchange_repository if exchange_repository is not None else ExchangeRepository()
        )

    @staticmethod
    def serialize(item):
        return {
            "id": str(item["_id"]),
            "exchange_id": item["exchange_id"],
            "exchange_title": item.get("exchange_title", ""),
            "requester_id": item["requester_id"],
            "owner_id": item["owner_id"],
            "message": item["message"],
            "status": item["status"],
            "created_at": item["created_at"],
        }

    async def create(self, requester_id, data):
        from backend.app.database.mongodb import client

        try:
            session = client.start_session()
            if inspect.isawaitable(session):
                session = await session
            async with session:
                transaction = session.start_transaction()
                if inspect.isawaitable(transaction):
                    transaction = await transaction
                async with transaction:
                    exchange = await self.exchange_repository.touch_if_available(
                        data.exchange_id, session=session
                    )

                    if exchange is None:
                        raise ValueError(
                            "Esta publicación ya no está disponible. "
                            "Actualiza el catálogo para consultar otros intercambios."
                        )

                    if exchange["owner_id"] == requester_id:
                        raise ValueError(
                            "No puedes solicitar tus propias publicaciones"
                        )

                    document = {
                        **data.model_dump(),
                        "requester_id": requester_id,
                        "owner_id": exchange["owner_id"],
                        "exchange_title": exchange["title"],
                        "status": "pendiente",
                        "created_at": datetime.now(timezone.utc),
                    }

                    created = await self.repository.create(
                        document, session=session
                    )

        except DuplicateKeyError as exc:
            raise ValueError(
                "Ya tienes una solicitud pendiente para esta publicación. "
                "Revisa tus solicitudes enviadas antes de intentar nuevamente."
            ) from exc
        except OperationFailure as exc:
            if exc.has_error_label("TransientTransactionError"):
                raise ValueError(
                    "La publicación está siendo modificada. Intenta nuevamente."
                ) from exc
            raise

        return await self.serialize_with_exchange_status(created)

    async def serialize_with_exchange_status(self, item):
        result = self.serialize(item)
        exchange = await self.exchange_repository.find_by_id(item["exchange_id"])
        result["exchange_status"] = exchange["status"] if exchange else None
        return result

    async def list_sent(self, requester_id):
        items = await self.repository.find_sent(requester_id)
        return [
            await self.serialize_with_exchange_status(item)
            for item in items
        ]

    async def list_received(self, owner_id):
        items = await self.repository.find_received(owner_id)
        return [
            await self.serialize_with_exchange_status(item)
            for item in items
        ]

    async def update_status(self, request_id, user_id, new_status):
        item = await self.repository.find_by_id(request_id)

        if item is None:
            return None

        if new_status == "cancelada":
            if item["requester_id"] != user_id:
                raise PermissionError("No puedes cancelar esta solicitud")
        elif new_status in ("aceptada", "rechazada"):
            if item["owner_id"] != user_id:
                raise PermissionError("No puedes responder esta solicitud")
        else:
            raise ValueError("Estado no permitido")

        if item["status"] != "pendiente":
            raise ValueError("La solicitud ya fue procesada")

        if new_status == "aceptada":
            from backend.app.database.mongodb import client

            session = client.start_session()
            if inspect.isawaitable(session):
                session = await session
            async with session:
                transaction = session.start_transaction()
                if inspect.isawaitable(transaction):
                    transaction = await transaction
                async with transaction:
                    reserved = await self.exchange_repository.reserve_if_available(
                        item["exchange_id"], item["owner_id"], session=session
                    )
                    if reserved is None:
                        raise ValueError("La publicación ya no está disponible")

                    updated = await self.repository.update_status(
                        request_id, "pendiente", new_status, session=session
                    )
                    if updated is None:
                        raise ValueError("La solicitud ya fue procesada")

                    await self.repository.reject_other_pending(
                        item["exchange_id"], request_id, session=session
                    )

            return await self.serialize_with_exchange_status(updated)

        updated = await self.repository.update_status(
            request_id, "pendiente", new_status
        )

        if updated is None:
            raise ValueError("La solicitud ya fue procesada")

        return await self.serialize_with_exchange_status(updated)
