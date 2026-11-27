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
            "token_version": 0,
        }

        user = await self.repository.create(document)

        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "is_active": user["is_active"],
        }

    async def update_profile(self, user_id: str, data):
        """Validar y actualizar el nombre del usuario autenticado."""
        name = data.name.strip()

        if len(name) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres.")

        user = await self.repository.update_profile(user_id, name)

        if user is None:
            return None

        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "is_active": user["is_active"],
        }
    async def change_password(self, user_id: str, data):
        """Verificar la contraseña actual y guardar el nuevo hash."""
        user = await self.repository.find_by_id(user_id)

        if user is None or not user.get("is_active", False):
            return None

        current_hash = user["hashed_password"]

        if not password_hash.verify(data.current_password, current_hash):
            raise ValueError("La contraseña actual es incorrecta.")

        if data.current_password == data.new_password:
            raise ValueError(
                "La nueva contraseña debe ser diferente de la actual."
            )

        new_hash = password_hash.hash(data.new_password)

        updated = await self.repository.update_password(
            user_id,
            current_hash,
            new_hash,
        )

        if not updated:
            raise ValueError(
                "La contraseña fue modificada durante la operación. "
                "Intenta nuevamente."
            )

        return True
    async def authenticate(self, email: str, password: str):
        """Validar credenciales de inicio de sesión."""
        user = await self.repository.find_by_email(email.lower())

        if not user or not user.get("is_active", False):
            return None

        if not password_hash.verify(password, user["hashed_password"]):
            return None

        return user
