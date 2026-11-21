"""Repositorio de publicaciones de intercambio en MongoDB."""

from bson import ObjectId

from backend.app.database.mongodb import database


class ExchangeRepository:
    """Operaciones de persistencia de publicaciones."""

    def __init__(self):
        self.collection = database["exchanges"]

    async def create(self, exchange_data: dict):
        """Guardar una publicación y devolver su documento."""
        result = await self.collection.insert_one(exchange_data)
        return await self.collection.find_one({"_id": result.inserted_id})

    async def find_available(self):
        """Listar publicaciones disponibles, de más recientes a antiguas."""
        cursor = self.collection.find({"status": "disponible"}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def find_by_owner(self, owner_id: str):
        """Listar publicaciones de un usuario."""
        cursor = self.collection.find({"owner_id": owner_id})
        return await cursor.to_list(length=100)

    async def find_by_id(self, exchange_id: str):
        """Buscar una publicación por identificador."""
        if not ObjectId.is_valid(exchange_id):
            return None

        return await self.collection.find_one({"_id": ObjectId(exchange_id)})

    async def delete(self, exchange_id: str, owner_id: str):
        """Eliminar una publicación únicamente si pertenece al usuario."""
        if not ObjectId.is_valid(exchange_id):
            return False

        result = await self.collection.delete_one(
            {"_id": ObjectId(exchange_id), "owner_id": owner_id}
        )
        return result.deleted_count == 1
