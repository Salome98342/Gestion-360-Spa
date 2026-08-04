"""
apps/servicios/admin.py

Registro de modelos de servicios en el admin de Django.
"""

from django.contrib import admin

from .models import Servicio, HorarioAtencion, DiaExcepcion


@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ("nombre", "empresa", "duracion_minutos", "precio", "activo")
    list_filter = ("activo",)
    search_fields = ("nombre",)


@admin.register(HorarioAtencion)
class HorarioAtencionAdmin(admin.ModelAdmin):
    list_display = ("empresa", "sucursal", "dia_semana", "hora_inicio", "hora_fin")
    list_filter = ("dia_semana",)


@admin.register(DiaExcepcion)
class DiaExcepcionAdmin(admin.ModelAdmin):
    list_display = ("fecha", "empresa", "cerrado_todo_dia", "motivo")
    list_filter = ("cerrado_todo_dia",)

