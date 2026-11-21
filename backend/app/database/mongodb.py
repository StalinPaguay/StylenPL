"""Conexión asíncrona a MongoDB."""

from pymongo import AsyncMongoClient

from backend.app.core.config import settings


client = AsyncMongoClient(
    settings.MONGODB_URI,
    serverSelectionTimeoutMS=5000,
)

database = client[settings.MONGODB_DATABASE]
