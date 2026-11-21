"""Configuración de autenticación JWT."""

import os
from datetime import datetime, timedelta, timezone

import jwt

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(user_id: str) -> str:
    """Generar un token de acceso con vencimiento."""
    if not JWT_SECRET_KEY:
        raise RuntimeError("Configura JWT_SECRET_KEY en las variables de entorno")

    expires = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": user_id, "exp": expires}

    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> str:
    """Validar un token y devolver el identificador del usuario."""
    if not JWT_SECRET_KEY:
        raise RuntimeError("Configura JWT_SECRET_KEY en las variables de entorno")

    payload = jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms=[JWT_ALGORITHM],
        options={"require": ["sub", "exp"]},
    )
    return payload["sub"]
