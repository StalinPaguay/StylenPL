"""Punto de entrada de la API StyleInPL."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.app.repositories.exchange_repository import ExchangeRepository

from backend.app.core.config import settings
from backend.app.views.routers.health import router as health_router
from backend.app.views.routers.auth import router as auth_router
from backend.app.views.routers.clothing import router as clothing_router
from backend.app.views.routers.exchange import router as exchange_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Preparar los índices de MongoDB al iniciar la API."""
    await ExchangeRepository().ensure_indexes()
    yield


app = FastAPI(
    lifespan=lifespan,
    title=settings.APP_NAME,
    description="API del armario virtual y mercado de intercambio.",
    version=settings.APP_VERSION,
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(clothing_router)
app.include_router(exchange_router)
