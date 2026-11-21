"""Repositorio de usuarios en MongoDB."""

from bson import ObjectId

from backend.app.database.mongodb import database


class UserRepository:
    """Operaciones de persistencia de usuarios."""

    def __init__(self):
        self.collection = database["users"]

    async def find_by_email(self, email: str):
        """Buscar un usuario por correo electrónico."""
        return await self.collection.find_one({"email": email.lower()})

    async def create(self, user_data: dict):
        """Guardar un usuario y devolver su documento."""
        result = await self.collection.insert_one(user_data)
        return await self.collection.find_one({"_id": result.inserted_id})

    async def find_by_id(self, user_id: str):
        """Buscar un usuario por su identificador."""
        if not ObjectId.is_valid(user_id):
            return None

        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def ensure_indexes(self):
        """Evitar correos electrónicos duplicados."""
        await self.collection.create_index("email", unique=True)
