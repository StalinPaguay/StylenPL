"""Rutas API para solicitudes de intercambio."""

from fastapi import APIRouter, Depends, status

from backend.app.controllers.exchange_request_controller import (
    ExchangeRequestController,
)
from backend.app.core.dependencies import get_current_user_id
from backend.app.schemas.exchange_request import (
    ExchangeRequestCreate,
    ExchangeRequestResponse,
    ExchangeRequestStatusUpdate,
)

router = APIRouter(
    prefix="/exchange-requests",
    tags=["Solicitudes de intercambio"],
)


@router.post(
    "/",
    response_model=ExchangeRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_request(
    data: ExchangeRequestCreate,
    user_id: str = Depends(get_current_user_id),
):
    return await ExchangeRequestController().create(user_id, data)


@router.get("/sent", response_model=list[ExchangeRequestResponse])
async def list_sent_requests(
    user_id: str = Depends(get_current_user_id),
):
    return await ExchangeRequestController().list_sent(user_id)


@router.get("/received", response_model=list[ExchangeRequestResponse])
async def list_received_requests(
    user_id: str = Depends(get_current_user_id),
):
    return await ExchangeRequestController().list_received(user_id)


@router.patch("/{request_id}/status", response_model=ExchangeRequestResponse)
async def update_request_status(
    request_id: str,
    data: ExchangeRequestStatusUpdate,
    user_id: str = Depends(get_current_user_id),
):
    return await ExchangeRequestController().update_status(
        request_id, user_id, data.status
    )


@router.patch("/{request_id}/cancel", response_model=ExchangeRequestResponse)
async def cancel_request(
    request_id: str,
    user_id: str = Depends(get_current_user_id),
):
    return await ExchangeRequestController().update_status(
        request_id, user_id, "cancelada"
    )
