"""
apps/usuarios/models.py

Modelo de usuario personalizado que reemplaza a auth.User.
Usa campos heredados de AbstractUser (username, password, email, etc.)
y añade los atributos del negocio.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        DUENO = "DUENO", "Dueño"
        EMPLEADO = "EMPLEADO", "Empleado"
        SOPORTE = "SOPORTE", "Soporte"

    # ── Relaciones ──────────────────────────────────────────
    empresa = models.ForeignKey(
        "empresas.Empresa",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="usuarios",
    )

    # ── Campos extra ────────────────────────────────────────
    rol = models.TextField(
        choices=Rol.choices,
        default=Rol.EMPLEADO,
    )

    # ── Meta ────────────────────────────────────────────────
    class Meta:
        db_table = "auth_user"  # Reutiliza la tabla auth_user de Django
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"

    # ── Propiedades de negocio ──────────────────────────────

    @property
    def es_staff_interno(self) -> bool:
        """Usuario sin empresa asignada = staff interno (soporte/admin)."""
        return self.empresa_id is None

    @property
    def puede_administrar_empresa(self) -> bool:
        """
        True si el usuario puede hacer login en el panel de su empresa.
        - Staff interno (sin empresa) siempre puede.
        - Usuarios de empresa sólo si la empresa está activa y tiene licencia vigente.
        """
        if self.es_staff_interno:
            return True
        if self.empresa_id and self.empresa.tiene_acceso:
            return True
        return False

    def pertenece_a(self, empresa) -> bool:
        """¿Este usuario pertenece a la empresa indicada?"""
        return self.empresa_id == empresa.id

