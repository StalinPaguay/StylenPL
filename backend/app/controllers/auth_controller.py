"""Controlador de autenticación de usuarios."""

from fastapi import HTTPException, status

from backend.app.core.security import create_access_token
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse
from backend.app.services.user_service import UserService


class AuthController:
    """Gestionar registro e inicio de sesión."""

    def __init__(self, service=None):
        self.service = service or UserService()

    async def register(self, data: UserCreate) -> UserResponse:
        """Registrar un nuevo usuario."""
        try:
            user = await self.service.register(data)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El correo electrónico ya está registrado",
            ) from exc

        return UserResponse(**user)

    async def login(self, data: UserLogin) -> dict:
        """Autenticar al usuario y generar su token."""
        user = await self.service.authenticate(str(data.email), data.password)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        token = create_access_token(
            str(user["_id"]),
            token_version=user.get("token_version", 0),
        )
        return {"access_token": token, "token_type": "bearer"}
