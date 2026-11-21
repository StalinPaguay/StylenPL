"""Configuración central de StyleInPL."""

import os


class Settings:
    """Configuración de la aplicación."""

    APP_NAME = os.getenv("APP_NAME", "StyleInPL API")
    APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/")
    MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "stylenpl")


settings = Settings()
