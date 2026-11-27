"""Repositorio de prendas del armario virtual en MongoDB."""

from bson import ObjectId

from backend.app.database.mongodb import database


class ClothingRepository:
    """Operaciones de persistencia de prendas."""

    def __init__(self):
        self.collection = database["clothing"]

    async def create(self, clothing_data: dict):
        """Guardar una prenda y devolver su documento."""
        result = await self.collection.insert_one(clothing_data)
        return await self.collection.find_one({"_id": result.inserted_id})

    async def find_by_owner(self, owner_id: str):
        """Obtener las prendas de un usuario."""
        cursor = self.collection.find({"owner_id": owner_id})
        return await cursor.to_list(length=100)

    async def find_by_id_and_owner(self, clothing_id: str, owner_id: str):
        """Buscar una prenda perteneciente a un usuario."""
        if not ObjectId.is_valid(clothing_id):
            return None

        return await self.collection.find_one(
            {"_id": ObjectId(clothing_id), "owner_id": owner_id}
        )

    async def delete(self, clothing_id: str, owner_id: str):
        """Eliminar una prenda únicamente si pertenece al usuario."""
        if not ObjectId.is_valid(clothing_id):
            return False

        result = await self.collection.delete_one(
            {"_id": ObjectId(clothing_id), "owner_id": owner_id}
        )
        return result.deleted_count == 1

    async def update(self, clothing_id: str, owner_id: str, changes: dict):
        """Actualizar una prenda únicamente si pertenece al usuario."""
        if not ObjectId.is_valid(clothing_id):
            return None

        query = {
            "_id": ObjectId(clothing_id),
            "owner_id": owner_id,
        }

        if changes:
            await self.collection.update_one(
                query,
                {"$set": changes},
            )

        return await self.collection.find_one(query)
