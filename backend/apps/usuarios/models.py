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
        # FIX: ya no existe una tabla "auth_user" que reutilizar (Django la
        # deja de crear en cuanto declaras AUTH_USER_MODEL). Nombre propio.
        db_table = "usuario"
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"

    # ── Propiedades de negocio ──────────────────────────────

    @property
    def es_staff_interno(self) -> bool:
        """
        Usuario de nuestro equipo (no pertenece a una empresa cliente).
        FIX: antes esto se decidía por "self.empresa_id is None", lo cual
        es peligroso — un DUENO/EMPLEADO sin empresa asignada todavía
        (a mitad de un registro, por ejemplo) quedaba tratado como staff
        interno y pasaba puede_administrar_empresa sin licencia de por
        medio. Ahora se decide únicamente por el rol.
        """
        # Los superusuarios creados con ``createsuperuser`` son la cuenta
        # administrativa de la plataforma aunque su rol de negocio no se haya
        # cambiado manualmente a SOPORTE.  Exigir sólo el campo ``rol``
        # bloqueaba a la cuenta admin legítima de Django.
        return self.is_superuser or self.rol == self.Rol.SOPORTE

    @property
    def puede_administrar_empresa(self) -> bool:
        """
        True si el usuario puede hacer login en el panel de su empresa.
        - Staff interno (SOPORTE) siempre puede.
        - Usuarios de empresa sólo si la empresa está activa y tiene
          licencia vigente.
        """
        if self.es_staff_interno:
            return True
        if self.empresa_id and self.empresa.tiene_acceso:
            return True
        return False

    def pertenece_a(self, empresa) -> bool:
        """¿Este usuario pertenece a la empresa indicada?"""
        empresa_id = getattr(empresa, "id", empresa)
        return self.empresa_id == empresa_id
