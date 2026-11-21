"""Esquemas de validación para publicaciones de intercambio."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ExchangeStatus = Literal["disponible", "reservado", "intercambiado"]


class ExchangeCreate(BaseModel):
    """Datos para publicar una prenda en el mercado."""

    clothing_id: str = Field(min_length=24, max_length=24)
    title: str = Field(min_length=5, max_length=120)
    description: str = Field(min_length=10, max_length=500)


class ExchangeResponse(ExchangeCreate):
    """Datos públicos de una publicación."""

    id: str
    owner_id: str
    status: ExchangeStatus
    created_at: datetime
