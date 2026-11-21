"""Servicio de usuarios y seguridad de contraseñas."""

from pwdlib import PasswordHash

from backend.app.repositories.user_repository import UserRepository

password_hash = PasswordHash.recommended()


class UserService:
    """Lógica de negocio para usuarios."""

    def __init__(self, repository=None):
        self.repository = repository or UserRepository()

    async def register(self, user_data):
        """Registrar un usuario sin guardar su contraseña original."""
        email = str(user_data.email).lower()

        if await self.repository.find_by_email(email):
            raise ValueError("El correo electrónico ya está registrado")

        document = {
            "name": user_data.name,
            "email": email,
            "hashed_password": password_hash.hash(user_data.password),
            "is_active": True,
        }

        user = await self.repository.create(document)

        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "is_active": user["is_active"],
        }

    async def authenticate(self, email: str, password: str):
        """Validar credenciales de inicio de sesión."""
        user = await self.repository.find_by_email(email.lower())

        if not user or not user.get("is_active", False):
            return None

        if not password_hash.verify(password, user["hashed_password"]):
            return None

        return user
