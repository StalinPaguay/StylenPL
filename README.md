# StyleInPL

Aplicación web de armario virtual e intercambio de prendas.

## Tecnologías
- React, Vite y Tailwind CSS
- FastAPI, Python y MongoDB
- Docker Compose y Nginx
- Autenticación JWT y Argon2

## Funcionalidades
- Registro e inicio de sesión
- Gestión de prendas
- Publicación y búsqueda de intercambios
- Gestión de estados de intercambio
- Protección de operaciones por usuario

## Ejecución
docker compose -p stylenpl -f infrastructure/compose.yaml -f infrastructure/compose.local.yaml up -d --build

## Direcciones
- Aplicación: http://127.0.0.1:5173/
- API: http://127.0.0.1:8000/
- Swagger: http://127.0.0.1:8000/docs

## Pruebas
- Backend: python -m pytest backend/tests -v
- Calidad: python -m ruff check backend
- Frontend: npm run lint y npm run build
