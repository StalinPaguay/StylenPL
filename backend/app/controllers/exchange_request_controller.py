"""Controlador de solicitudes de intercambio."""

from fastapi import HTTPException, status

from backend.app.schemas.exchange_request import ExchangeRequestResponse
from backend.app.services.exchange_request_service import ExchangeRequestService


class ExchangeRequestController:
    def __init__(self, service=None):
        self.service = service if service is not None else ExchangeRequestService()

    async def create(self, requester_id, data):
        try:
            result = await self.service.create(requester_id, data)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(exc),
            ) from exc

        return ExchangeRequestResponse(**result)

    async def list_sent(self, requester_id):
        items = await self.service.list_sent(requester_id)
        return [ExchangeRequestResponse(**item) for item in items]

    async def list_received(self, owner_id):
        items = await self.service.list_received(owner_id)
        return [ExchangeRequestResponse(**item) for item in items]

    async def update_status(self, request_id, user_id, new_status):
        try:
            result = await self.service.update_status(
                request_id, user_id, new_status
            )
        except PermissionError as exc:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(exc),
            ) from exc
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(exc),
            ) from exc

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Solicitud no encontrada",
            )

        return ExchangeRequestResponse(**result)
