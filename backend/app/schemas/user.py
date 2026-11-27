"""Esquemas de validación para usuarios."""

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Datos necesarios para registrar un usuario."""

    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    """Datos públicos del usuario, sin contraseña."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    is_active: bool = True


class UserLogin(BaseModel):
    """Credenciales para iniciar sesión."""

    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    """Datos permitidos para actualizar el perfil."""
    name: str = Field(min_length=2, max_length=100)

class UserPasswordChange(BaseModel):
    """Datos necesarios para cambiar la contraseña."""
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)
