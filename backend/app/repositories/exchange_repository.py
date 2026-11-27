"""OperaciÃ³n de persistencia de publicaciones."""

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from backend.app.database.mongodb import database


class ExchangeRepository:
    """OperaciÃ³n de persistencia de publicaciones."""

    def __init__(self):
        self.collection = database["exchanges"]

    async def create(self, exchange_data: dict):
        """OperaciÃ³n de persistencia de publicaciones."""
        try:
            result = await self.collection.insert_one(exchange_data)
        except DuplicateKeyError as exc:
            raise ValueError(
                "La prenda ya tiene una publicaciÃ³n activa"
            ) from exc

        return await self.collection.find_one({"_id": result.inserted_id})

    async def find_available(self):
        """OperaciÃ³n de persistencia de publicaciones."""
        cursor = self.collection.find({"status": "disponible"}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def find_by_owner(self, owner_id: str):
        """OperaciÃ³n de persistencia de publicaciones."""
        cursor = self.collection.find({"owner_id": owner_id})
        return await cursor.to_list(length=100)

    async def find_by_id(self, exchange_id: str, session=None):
        """Consultar una publicación, opcionalmente dentro de una transacción."""
        if not ObjectId.is_valid(exchange_id):
            return None

        return await self.collection.find_one(
            {"_id": ObjectId(exchange_id)},
            session=session,
        )
    async def delete(self, exchange_id: str, owner_id: str, session=None):
        """OperaciÃ³n de persistencia de publicaciones."""
        if not ObjectId.is_valid(exchange_id):
            return False

        result = await self.collection.delete_one(
            {"_id": ObjectId(exchange_id), "owner_id": owner_id, "status": "disponible"},
            session=session,
        )
        return result.deleted_count == 1

    async def update_status(self, exchange_id: str, owner_id: str, new_status: str):
        """OperaciÃ³n de persistencia de publicaciones."""
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
                "La prenda ya tiene una publicaciÃ³n activa"
            ) from exc

    async def find_active_by_clothing(self, clothing_id: str, owner_id: str):
        """OperaciÃ³n de persistencia de publicaciones."""
        return await self.collection.find_one(
            {
                "clothing_id": clothing_id,
                "owner_id": owner_id,
                "status": {"$in": ["disponible", "reservado"]},
            }
        )
    async def ensure_indexes(self):
        """OperaciÃ³n de persistencia de publicaciones."""
        await self.collection.create_index(
            [("owner_id", 1), ("clothing_id", 1)],
            unique=True,
            partialFilterExpression={
                "status": {"$in": ["disponible", "reservado"]}
            },
            name="unique_active_exchange_per_clothing",
        )
    async def update(self, exchange_id: str, owner_id: str, changes: dict):
        """Editar Ãºnicamente una publicaciÃ³n perteneciente al usuario."""
        if not ObjectId.is_valid(exchange_id):
            return None

        query = {
            "_id": ObjectId(exchange_id),
            "owner_id": owner_id,
            "status": "disponible",
        }

        if not changes:
            return await self.collection.find_one(query)

        return await self.collection.find_one_and_update(
            query,
            {"$set": changes},
            return_document=True,
        )

    async def complete_if_reserved(self, exchange_id: str, owner_id: str):
        """Finalizar una publicación solo si continúa reservada."""
        if not ObjectId.is_valid(exchange_id):
            return None

        return await self.collection.find_one_and_update(
            {
                "_id": ObjectId(exchange_id),
                "owner_id": owner_id,
                "status": "reservado",
            },
            {"$set": {"status": "intercambiado"}},
            return_document=True,
        )
    async def reserve_if_available(self, exchange_id: str, owner_id: str, session=None):
        """Reservar una publicaciÃ³n solo si continÃºa disponible."""
        if not ObjectId.is_valid(exchange_id):
            return None

        return await self.collection.find_one_and_update(
            {
                "_id": ObjectId(exchange_id),
                "owner_id": owner_id,
                "status": "disponible",
            },
            {"$set": {"status": "reservado"}},
            return_document=True,
            session=session,
        )

    async def touch_if_available(self, exchange_id: str, session=None):
        """Proteger una publicación disponible frente a cambios simultáneos."""
        if not ObjectId.is_valid(exchange_id):
            return None

        return await self.collection.find_one_and_update(
            {
                "_id": ObjectId(exchange_id),
                "status": "disponible",
            },
            {"$inc": {"request_version": 1}},
            return_document=True,
            session=session,
        )
