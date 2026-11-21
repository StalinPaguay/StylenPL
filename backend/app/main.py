"""Punto de entrada de la API StyleInPL."""

from fastapi import FastAPI

from backend.app.core.config import settings
from backend.app.views.routers.health import router as health_router
from backend.app.views.routers.auth import router as auth_router

app = FastAPI(
    title=settings.APP_NAME,
    description="API del armario virtual y mercado de intercambio.",
    version=settings.APP_VERSION,
)

app.include_router(health_router)
app.include_router(auth_router)
