"""Dependencia para proteger rutas mediante JWT."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError

from backend.app.core.security import decode_access_token

bearer_scheme = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """Validar el token JWT y obtener el identificador del usuario."""
    try:
        user_id = decode_access_token(credentials.credentials)

        if not user_id:
            raise InvalidTokenError("Token sin identificador")

        return user_id

    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
