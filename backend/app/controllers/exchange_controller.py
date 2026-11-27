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
            message = str(exc)

            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                    if "ya tiene una" in message
                    else status.HTTP_404_NOT_FOUND
                ),
                detail=message,
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
        """Consultar una publicaciÃƒÂ³n."""
        exchange = await self.service.get_by_id(exchange_id)

        if exchange is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PublicaciÃƒÂ³n no encontrada",
            )

        return ExchangeResponse(**exchange)

    async def delete(self, exchange_id: str, owner_id: str) -> None:
        """Eliminar una publicaciÃƒÂ³n propia."""
        try:
            deleted = await self.service.delete(exchange_id, owner_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(exc),
            ) from exc

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PublicaciÃƒÂ³n no encontrada",
            )

    async def update_status(
        self, exchange_id: str, owner_id: str, new_status: str
    ) -> ExchangeResponse:
        """Actualizar el estado de una publicaciÃ³n propia."""
        try:
            exchange = await self.service.update_status(
                exchange_id, owner_id, new_status
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(exc),
            ) from exc

        if exchange is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PublicaciÃ³n no encontrada",
            )

        return ExchangeResponse(**exchange)

    async def update(self, exchange_id: str, owner_id: str, data):
        """Editar una publicaciÃ³n perteneciente al usuario autenticado."""
        try:
            exchange = await self.service.update(exchange_id, owner_id, data)
        except ValueError as exc:
            message = str(exc)
            is_conflict = (
                "No se puede editar una publicación" in message
                or "cambió de estado durante la edición" in message
            )

            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                    if is_conflict
                    else status.HTTP_422_UNPROCESSABLE_CONTENT
                ),
                detail=message,
            ) from exc

        if exchange is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PublicaciÃ³n no encontrada",
            )

        return ExchangeResponse(**exchange)
