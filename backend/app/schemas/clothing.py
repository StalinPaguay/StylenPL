"""Esquemas de validación para prendas del armario virtual."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ClothingCategory = Literal[
    "camiseta",
    "pantalon",
    "vestido",
    "chaqueta",
    "calzado",
    "accesorio",
    "otro",
]


class ClothingCreate(BaseModel):
    """Datos para agregar una prenda al armario."""

    name: str = Field(min_length=2, max_length=100)
    category: ClothingCategory
    color: str = Field(min_length=2, max_length=50)
    size: str = Field(min_length=1, max_length=20)
    description: str | None = Field(default=None, max_length=500)


class ClothingResponse(ClothingCreate):
    """Datos públicos de una prenda registrada."""

    id: str
    owner_id: str
    created_at: datetime

class ClothingUpdate(BaseModel):
    """Datos permitidos para editar una prenda."""

    name: str | None = Field(default=None, min_length=2, max_length=100)
    category: ClothingCategory | None = None
    color: str | None = Field(default=None, min_length=2, max_length=50)
    size: str | None = Field(default=None, min_length=1, max_length=20)
    description: str | None = Field(default=None, max_length=500)
