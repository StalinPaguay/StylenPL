"""Servicio de gestión del armario virtual."""

from datetime import datetime, timezone

from backend.app.repositories.clothing_repository import ClothingRepository


class ClothingService:
    """Lógica de negocio para las prendas de cada usuario."""

    def __init__(self, repository=None):
        self.repository = repository if repository is not None else ClothingRepository()

    @staticmethod
    def serialize(clothing: dict) -> dict:
        """Convertir un documento MongoDB en una respuesta pública."""
        return {
            "id": str(clothing["_id"]),
            "owner_id": clothing["owner_id"],
            "name": clothing["name"],
            "category": clothing["category"],
            "color": clothing["color"],
            "size": clothing["size"],
            "description": clothing.get("description"),
            "created_at": clothing["created_at"],
        }

    async def create(self, owner_id: str, data):
        """Agregar una prenda al armario del usuario."""
        document = {
            **data.model_dump(),
            "owner_id": owner_id,
            "created_at": datetime.now(timezone.utc),
        }
        clothing = await self.repository.create(document)
        return self.serialize(clothing)

    async def list_by_owner(self, owner_id: str):
        """Listar las prendas del usuario."""
        clothing = await self.repository.find_by_owner(owner_id)
        return [self.serialize(item) for item in clothing]

    async def get_by_id(self, clothing_id: str, owner_id: str):
        """Obtener una prenda únicamente si pertenece al usuario."""
        clothing = await self.repository.find_by_id_and_owner(clothing_id, owner_id)
        return self.serialize(clothing) if clothing else None

    async def delete(self, clothing_id: str, owner_id: str):
        """Eliminar una prenda únicamente si pertenece al usuario."""
        return await self.repository.delete(clothing_id, owner_id)

    async def update(self, clothing_id: str, owner_id: str, data):
        """Editar una prenda perteneciente al usuario autenticado."""
        changes = data.model_dump(exclude_unset=True)

        # Los campos obligatorios no pueden quedar en null.
        required_fields = {"name", "category", "color", "size"}
        if any(changes.get(field) is None for field in required_fields & changes.keys()):
            raise ValueError("Los campos obligatorios no pueden ser nulos")

        clothing = await self.repository.update(
            clothing_id,
            owner_id,
            changes,
        )

        return self.serialize(clothing) if clothing else None
