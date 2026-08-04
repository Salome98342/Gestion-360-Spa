"""
apps/servicios/models.py

Modelos de servicios, horarios de atención y días de excepción.
"""

from django.db import models


class Servicio(models.Model):
    class Meta:
        db_table = "servicio"
        indexes = [
            models.Index(fields=["empresa", "activo"]),
        ]
        ordering = ["orden"]

    empresa = models.ForeignKey("empresas.Empresa", on_delete=models.CASCADE, related_name="servicios")
    sucursal = models.ForeignKey("empresas.Sucursal", on_delete=models.SET_NULL, null=True, blank=True, related_name="servicios")
    nombre = models.TextField()
    duracion_minutos = models.IntegerField()
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    icono = models.TextField(default="fa-hand-sparkles")
    descripcion = models.TextField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class HorarioAtencion(models.Model):
    class Meta:
        db_table = "horario_atencion"
        unique_together = ["empresa", "sucursal", "dia_semana", "hora_inicio"]

    empresa = models.ForeignKey("empresas.Empresa", on_delete=models.CASCADE, related_name="horarios")
    sucursal = models.ForeignKey("empresas.Sucursal", on_delete=models.CASCADE, null=True, blank=True, related_name="horarios")
    dia_semana = models.SmallIntegerField()  # 0=domingo ... 6=sábado
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.get_dia_semana_display()} {self.hora_inicio}-{self.hora_fin}"


class DiaExcepcion(models.Model):
    class Meta:
        db_table = "dia_excepcion"
        indexes = [
            models.Index(fields=["empresa", "fecha"]),
        ]

    empresa = models.ForeignKey("empresas.Empresa", on_delete=models.CASCADE, related_name="excepciones")
    sucursal = models.ForeignKey("empresas.Sucursal", on_delete=models.CASCADE, null=True, blank=True, related_name="excepciones")
    fecha = models.DateField()
    cerrado_todo_dia = models.BooleanField(default=True)
    hora_inicio = models.TimeField(null=True, blank=True)
    hora_fin = models.TimeField(null=True, blank=True)
    motivo = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Excepción {self.fecha} - {self.empresa_id}"

