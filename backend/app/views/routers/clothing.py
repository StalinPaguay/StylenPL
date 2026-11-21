"""Rutas protegidas del armario virtual."""

from fastapi import APIRouter, Depends, Response, status

from backend.app.controllers.clothing_controller import ClothingController
from backend.app.core.dependencies import get_current_user_id
from backend.app.schemas.clothing import ClothingCreate, ClothingResponse

router = APIRouter(prefix="/clothing", tags=["Armario virtual"])


@router.post(
    "/",
    response_model=ClothingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_clothing(
    data: ClothingCreate,
    owner_id: str = Depends(get_current_user_id),
):
    """Agregar una prenda al armario."""
    return await ClothingController().create(owner_id, data)


@router.get("/", response_model=list[ClothingResponse])
async def list_clothing(owner_id: str = Depends(get_current_user_id)):
    """Listar las prendas del usuario autenticado."""
    return await ClothingController().list_by_owner(owner_id)


@router.get("/{clothing_id}", response_model=ClothingResponse)
async def get_clothing(
    clothing_id: str,
    owner_id: str = Depends(get_current_user_id),
):
    """Consultar una prenda del usuario."""
    return await ClothingController().get_by_id(clothing_id, owner_id)


@router.delete("/{clothing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clothing(
    clothing_id: str,
    owner_id: str = Depends(get_current_user_id),
):
    """Eliminar una prenda del usuario."""
    await ClothingController().delete(clothing_id, owner_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
