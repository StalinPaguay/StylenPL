"""Rutas HTTP de autenticación."""

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.controllers.auth_controller import AuthController
from backend.app.core.dependencies import get_current_user_id
from backend.app.repositories.user_repository import UserRepository
from backend.app.services.user_service import UserService
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse, UserProfileUpdate, UserPasswordChange

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(data: UserCreate):
    """Registrar un nuevo usuario."""
    return await AuthController().register(data)


@router.post("/login")
async def login(data: UserLogin):
    """Iniciar sesión y obtener un token JWT."""
    return await AuthController().login(data)

@router.get("/me", response_model=UserResponse)
async def get_my_profile(user_id: str = Depends(get_current_user_id)):
    """Consultar los datos del usuario autenticado."""
    user = await UserRepository().find_by_id(user_id)

    if user is None or not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "is_active": user["is_active"],
    }

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    data: UserProfileUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """Actualizar el nombre del usuario autenticado."""
    try:
        user = await UserService().update_profile(user_id, data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return user

@router.patch("/password")
async def change_my_password(
    data: UserPasswordChange,
    user_id: str = Depends(get_current_user_id),
):
    """Cambiar la contraseña del usuario autenticado."""
    try:
        changed = await UserService().change_password(user_id, data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    if changed is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return {"message": "Contraseña actualizada correctamente."}
