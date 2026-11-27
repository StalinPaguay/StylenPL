"""Controlador del armario virtual."""

from fastapi import HTTPException, status

from backend.app.schemas.clothing import ClothingCreate, ClothingResponse, ClothingUpdate
from backend.app.services.clothing_service import ClothingService


class ClothingController:
    """Gestionar las operaciones del armario virtual."""

    def __init__(self, service=None):
        self.service = service if service is not None else ClothingService()

    async def create(self, owner_id: str, data: ClothingCreate) -> ClothingResponse:
        """Registrar una prenda del usuario."""
        clothing = await self.service.create(owner_id, data)
        return ClothingResponse(**clothing)

    async def list_by_owner(self, owner_id: str) -> list[ClothingResponse]:
        """Listar las prendas del usuario."""
        clothing = await self.service.list_by_owner(owner_id)
        return [ClothingResponse(**item) for item in clothing]

    async def get_by_id(self, clothing_id: str, owner_id: str) -> ClothingResponse:
        """Consultar una prenda del usuario."""
        clothing = await self.service.get_by_id(clothing_id, owner_id)

        if clothing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prenda no encontrada",
            )

        return ClothingResponse(**clothing)

    async def delete(self, clothing_id: str, owner_id: str) -> None:
        """Eliminar una prenda del usuario."""
        deleted = await self.service.delete(clothing_id, owner_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prenda no encontrada",
            )

    async def update(
        self,
        clothing_id: str,
        owner_id: str,
        data: ClothingUpdate,
    ) -> ClothingResponse:
        """Actualizar una prenda del usuario autenticado."""
        try:
            clothing = await self.service.update(
                clothing_id,
                owner_id,
                data,
            )
        except ValueError as error:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(error),
            ) from error

        if clothing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prenda no encontrada",
            )

        return ClothingResponse(**clothing)
