"""Configuración central de StyleInPL."""

import os


class Settings:
    """Configuración de la aplicación."""

    APP_NAME = os.getenv("APP_NAME", "StyleInPL API")
    APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"


settings = Settings()
