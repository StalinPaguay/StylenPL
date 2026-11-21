"""Controlador de publicaciones de intercambio."""

from fastapi import HTTPException, status

from backend.app.schemas.exchange import ExchangeCreate, ExchangeResponse
from backend.app.services.exchange_service import ExchangeService


class ExchangeController:
    """Gestionar las publicaciones del mercado de intercambios."""

    def __init__(self, service=None):
        self.service = service if service is not None else ExchangeService()

    async def create(self, owner_id: str, data: ExchangeCreate) -> ExchangeResponse:
        """Publicar una prenda perteneciente al usuario."""
        try:
            exchange = await self.service.create(owner_id, data)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La prenda no existe o no pertenece al usuario",
            ) from exc

        return ExchangeResponse(**exchange)

    async def list_available(self) -> list[ExchangeResponse]:
        """Listar publicaciones disponibles."""
        exchanges = await self.service.list_available()
        return [ExchangeResponse(**item) for item in exchanges]

    async def list_by_owner(self, owner_id: str) -> list[ExchangeResponse]:
        """Listar publicaciones propias."""
        exchanges = await self.service.list_by_owner(owner_id)
        return [ExchangeResponse(**item) for item in exchanges]

    async def get_by_id(self, exchange_id: str) -> ExchangeResponse:
        """Consultar una publicación."""
        exchange = await self.service.get_by_id(exchange_id)

        if exchange is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publicación no encontrada",
            )

        return ExchangeResponse(**exchange)

    async def delete(self, exchange_id: str, owner_id: str) -> None:
        """Eliminar una publicación propia."""
        deleted = await self.service.delete(exchange_id, owner_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publicación no encontrada",
            )
