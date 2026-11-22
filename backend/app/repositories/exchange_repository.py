"""Operación de persistencia de publicaciones."""

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from backend.app.database.mongodb import database


class ExchangeRepository:
    """Operación de persistencia de publicaciones."""

    def __init__(self):
        self.collection = database["exchanges"]

    async def create(self, exchange_data: dict):
        """Operación de persistencia de publicaciones."""
        try:
            result = await self.collection.insert_one(exchange_data)
        except DuplicateKeyError as exc:
            raise ValueError(
                "La prenda ya tiene una publicación activa"
            ) from exc

        return await self.collection.find_one({"_id": result.inserted_id})

    async def find_available(self):
        """Operación de persistencia de publicaciones."""
        cursor = self.collection.find({"status": "disponible"}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def find_by_owner(self, owner_id: str):
        """Operación de persistencia de publicaciones."""
        cursor = self.collection.find({"owner_id": owner_id})
        return await cursor.to_list(length=100)

    async def find_by_id(self, exchange_id: str):
        """Operación de persistencia de publicaciones."""
        if not ObjectId.is_valid(exchange_id):
            return None

        return await self.collection.find_one({"_id": ObjectId(exchange_id)})

    async def delete(self, exchange_id: str, owner_id: str):
        """Operación de persistencia de publicaciones."""
        if not ObjectId.is_valid(exchange_id):
            return False

        result = await self.collection.delete_one(
            {"_id": ObjectId(exchange_id), "owner_id": owner_id}
        )
        return result.deleted_count == 1

    async def update_status(self, exchange_id: str, owner_id: str, new_status: str):
        """Operación de persistencia de publicaciones."""
        if not ObjectId.is_valid(exchange_id):
            return None

        try:
            return await self.collection.find_one_and_update(
                {
                    "_id": ObjectId(exchange_id),
                    "owner_id": owner_id,
                },
                {"$set": {"status": new_status}},
                return_document=True,
            )
        except DuplicateKeyError as exc:
            raise ValueError(
                "La prenda ya tiene una publicación activa"
            ) from exc

    async def find_active_by_clothing(self, clothing_id: str, owner_id: str):
        """Operación de persistencia de publicaciones."""
        return await self.collection.find_one(
            {
                "clothing_id": clothing_id,
                "owner_id": owner_id,
                "status": {"$in": ["disponible", "reservado"]},
            }
        )
    async def ensure_indexes(self):
        """Operación de persistencia de publicaciones."""
        await self.collection.create_index(
            [("owner_id", 1), ("clothing_id", 1)],
            unique=True,
            partialFilterExpression={
                "status": {"$in": ["disponible", "reservado"]}
            },
            name="unique_active_exchange_per_clothing",
        )