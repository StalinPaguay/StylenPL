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

    async def update_profile(self, user_id: str, name: str):
        """Actualizar el nombre de un usuario activo."""
        if not ObjectId.is_valid(user_id):
            return None

        return await self.collection.find_one_and_update(
            {"_id": ObjectId(user_id), "is_active": True},
            {"$set": {"name": name}},
            return_document=True,
        )

    async def update_password(
        self,
        user_id: str,
        current_hash: str,
        new_hash: str,
    ):
        """Actualizar el hash de contraseña de un usuario activo."""
        if not ObjectId.is_valid(user_id):
            return False

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
                "is_active": True,
                "hashed_password": current_hash,
            },
            {
                "$set": {"hashed_password": new_hash},
                "$inc": {"token_version": 1},
            },
        )

        return result.modified_count == 1

    async def ensure_indexes(self):
        """Evitar correos electrónicos duplicados."""
        await self.collection.create_index("email", unique=True)
