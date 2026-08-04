"""
apps/usuarios/admin.py

Registro del modelo Usuario en el admin de Django.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ("username", "email", "rol", "empresa", "is_staff", "is_active")
    list_filter = ("rol", "is_staff", "is_active", "empresa")
    fieldsets = UserAdmin.fieldsets + (
        ("Información del negocio", {"fields": ("rol", "empresa")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Información del negocio", {"fields": ("rol", "empresa")}),
    )

