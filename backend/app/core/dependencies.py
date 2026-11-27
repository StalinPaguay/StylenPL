"""Dependencia para proteger rutas mediante JWT."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError

from backend.app.core.security import decode_access_token
from backend.app.repositories.user_repository import UserRepository

bearer_scheme = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """Validar el JWT y comprobar que la sesión siga vigente."""
    try:
        user_id, token_version = decode_access_token(
            credentials.credentials
        )

        if not user_id:
            raise InvalidTokenError("Token sin identificador")

    except (InvalidTokenError, ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = await UserRepository().find_by_id(user_id)

    if (
        user is None
        or not user.get("is_active", False)
        or user.get("token_version", 0) != token_version
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión ya no es válida. Inicia sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id
