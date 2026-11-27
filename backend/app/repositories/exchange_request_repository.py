"""Persistencia de solicitudes de intercambio."""

from bson import ObjectId

from backend.app.database.mongodb import database


class ExchangeRequestRepository:
    def __init__(self):
        self.collection = database["exchange_requests"]

    async def create(self, data: dict, session=None):
        result = await self.collection.insert_one(data, session=session)
        return await self.collection.find_one(
            {"_id": result.inserted_id},
            session=session,
        )

    async def find_by_id(self, request_id: str):
        if not ObjectId.is_valid(request_id):
            return None

        return await self.collection.find_one({
            "_id": ObjectId(request_id)
        })

    async def find_sent(self, requester_id: str):
        cursor = self.collection.find({
            "requester_id": requester_id
        }).sort("created_at", -1)

        return await cursor.to_list(length=100)

    async def find_received(self, owner_id: str):
        cursor = self.collection.find({
            "owner_id": owner_id
        }).sort("created_at", -1)

        return await cursor.to_list(length=100)

    async def find_pending(self, exchange_id: str, requester_id: str):
        return await self.collection.find_one({
            "exchange_id": exchange_id,
            "requester_id": requester_id,
            "status": "pendiente",
        })

    async def update_status(
        self, request_id: str, expected_status: str, new_status: str, session=None
    ):
        if not ObjectId.is_valid(request_id):
            return None

        return await self.collection.find_one_and_update(
            {
                "_id": ObjectId(request_id),
                "status": expected_status,
            },
            {"$set": {"status": new_status}},
            return_document=True,
            session=session,
        )

    async def ensure_indexes(self):
        await self.collection.create_index(
            [("exchange_id", 1), ("requester_id", 1)],
            unique=True,
            partialFilterExpression={"status": "pendiente"},
            name="unique_pending_exchange_request",
        )
        await self.collection.create_index(
            [("requester_id", 1), ("created_at", -1)]
        )
        await self.collection.create_index(
            [("owner_id", 1), ("created_at", -1)]
        )

    async def reject_other_pending(self, exchange_id: str, accepted_request_id: str, session=None):
        """Rechazar otras solicitudes pendientes de la misma publicación."""
        if not ObjectId.is_valid(accepted_request_id):
            return 0

        result = await self.collection.update_many(
            {
                "exchange_id": exchange_id,
                "_id": {"$ne": ObjectId(accepted_request_id)},
                "status": "pendiente",
            },
            {"$set": {"status": "rechazada"}},
            session=session,
        )

        return result.modified_count

    async def reject_pending_by_exchange(self, exchange_id: str, session=None):
        """Cerrar las solicitudes pendientes de una publicación eliminada."""
        result = await self.collection.update_many(
            {
                "exchange_id": exchange_id,
                "status": "pendiente",
            },
            {"$set": {"status": "rechazada"}},
            session=session,
        )
        return result.modified_count
