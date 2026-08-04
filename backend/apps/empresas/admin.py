"""
apps/empresas/admin.py

Registro de modelos de empresa en el admin de Django.
"""

from django.contrib import admin

from .models import (
    Empresa,
    PlanLicencia,
    LicenciaToken,
    RenovacionLicencia,
    EventoEmpresa,
    Sucursal,
    ConfiguracionLanding,
    Cliente,
    Cita,
)


@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "slug", "activa", "creada_en")
    list_filter = ("activa",)
    search_fields = ("nombre", "slug")


@admin.register(PlanLicencia)
class PlanLicenciaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "precio_mensual", "activo")
    list_filter = ("activo",)


@admin.register(LicenciaToken)
class LicenciaTokenAdmin(admin.ModelAdmin):
    list_display = ("token", "empresa", "plan", "estado", "fecha_vencimiento")
    list_filter = ("estado",)


@admin.register(RenovacionLicencia)
class RenovacionLicenciaAdmin(admin.ModelAdmin):
    list_display = ("licencia", "fecha_renovacion", "meses_agregados", "monto_pagado")


@admin.register(EventoEmpresa)
class EventoEmpresaAdmin(admin.ModelAdmin):
    list_display = ("titulo", "empresa", "tipo", "fecha", "completado")
    list_filter = ("tipo", "completado")


@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    list_display = ("nombre", "empresa", "activa")
    list_filter = ("activa",)


@admin.register(ConfiguracionLanding)
class ConfiguracionLandingAdmin(admin.ModelAdmin):
    list_display = ("empresa",)


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("nombre", "telefono", "email", "empresa")
    search_fields = ("nombre", "telefono", "email")


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ("id", "cliente", "fecha", "hora", "servicio", "estado", "empresa")
    list_filter = ("estado", "fecha")

