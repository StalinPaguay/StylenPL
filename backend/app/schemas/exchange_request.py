"""Esquemas para las solicitudes de intercambio."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


RequestStatus = Literal["pendiente", "aceptada", "rechazada", "cancelada"]


class ExchangeRequestCreate(BaseModel):
    exchange_id: str = Field(min_length=24, max_length=24)
    message: str = Field(default="", max_length=500)


class ExchangeRequestResponse(ExchangeRequestCreate):
    id: str
    exchange_title: str = ""
    exchange_status: Literal["disponible", "reservado", "intercambiado"] | None = None
    requester_id: str
    owner_id: str
    status: RequestStatus
    created_at: datetime


class ExchangeRequestStatusUpdate(BaseModel):
    status: Literal["aceptada", "rechazada"]
