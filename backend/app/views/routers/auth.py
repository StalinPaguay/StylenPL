"""Rutas HTTP de autenticación."""

from fastapi import APIRouter, status

from backend.app.controllers.auth_controller import AuthController
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse

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
