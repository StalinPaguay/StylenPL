"""Rutas del mercado de intercambio de prendas."""

from fastapi import APIRouter, Depends, Response, status

from backend.app.controllers.exchange_controller import ExchangeController
from backend.app.core.dependencies import get_current_user_id
from backend.app.schemas.exchange import ExchangeCreate, ExchangeResponse, ExchangeStatusUpdate

router = APIRouter(prefix="/exchanges", tags=["Intercambios"])


@router.get("/", response_model=list[ExchangeResponse])
async def list_available_exchanges():
    """Consultar las publicaciones disponibles."""
    return await ExchangeController().list_available()


@router.get("/mine", response_model=list[ExchangeResponse])
async def list_my_exchanges(
    owner_id: str = Depends(get_current_user_id),
):
    """Consultar las publicaciones del usuario autenticado."""
    return await ExchangeController().list_by_owner(owner_id)


@router.post(
    "/",
    response_model=ExchangeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_exchange(
    data: ExchangeCreate,
    owner_id: str = Depends(get_current_user_id),
):
    """Publicar una prenda propia para intercambio."""
    return await ExchangeController().create(owner_id, data)


@router.get("/{exchange_id}", response_model=ExchangeResponse)
async def get_exchange(exchange_id: str):
    """Consultar una publicaciÃ³n por identificador."""
    return await ExchangeController().get_by_id(exchange_id)


@router.delete("/{exchange_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exchange(
    exchange_id: str,
    owner_id: str = Depends(get_current_user_id),
):
    """Eliminar una publicaciÃ³n propia."""
    await ExchangeController().delete(exchange_id, owner_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{exchange_id}/status", response_model=ExchangeResponse)
async def update_exchange_status(
    exchange_id: str,
    data: ExchangeStatusUpdate,
    owner_id: str = Depends(get_current_user_id),
):
    """Actualizar el estado de una publicación propia."""
    return await ExchangeController().update_status(
        exchange_id, owner_id, data.status
    )
from backend.app.schemas.exchange import ExchangeUpdate


@router.patch("/{exchange_id}", response_model=ExchangeResponse)
async def update_exchange(
    exchange_id: str,
    data: ExchangeUpdate,
    owner_id: str = Depends(get_current_user_id),
):
    """Editar el título y la descripción de una publicación propia."""
    return await ExchangeController().update(
        exchange_id, owner_id, data
    )
