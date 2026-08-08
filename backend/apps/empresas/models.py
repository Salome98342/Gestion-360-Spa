"""
apps/empresas/models.py

Empresa (tenant raíz) + sistema de licencias + configuración de landing.
"""

import calendar
import secrets
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone


def generar_token_licencia():
    """Genera un token no predecible para una licencia nueva."""
    return secrets.token_urlsafe(32)


def sumar_meses(fecha, meses):
    """Suma meses conservando el último día válido del mes destino."""
    mes = fecha.month - 1 + meses
    anio = fecha.year + mes // 12
    mes = mes % 12 + 1
    dia = min(fecha.day, calendar.monthrange(anio, mes)[1])
    return fecha.replace(year=anio, month=mes, day=dia)


class Empresa(models.Model):
    class Meta:
        db_table = "empresa"
        ordering = ["nombre"]

    nombre = models.TextField()
    slug = models.SlugField(max_length=80, unique=True)
    nit = models.TextField(null=True, blank=True)
    direccion = models.TextField(null=True, blank=True)
    telefono = models.TextField(null=True, blank=True)
    email_contacto = models.EmailField(null=True, blank=True)
    whatsapp = models.TextField(null=True, blank=True)

    moneda = models.TextField(default="COP")
    porcentaje_impuesto = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))

    logo_url = models.TextField(null=True, blank=True)
    color_primario = models.TextField(default="#db2777")
    color_secundario = models.TextField(default="#fff0f5")
    color_fondo = models.TextField(default="#f8fafc")
    color_superficie = models.TextField(default="#ffffff")
    color_texto = models.TextField(default="#111827")
    color_texto_boton = models.TextField(default="#ffffff")

    activa = models.BooleanField(default=True)
    creada_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

    @property
    def licencia_vigente(self):
        return self.licencias.filter(
            estado="ACTIVA",
            fecha_vencimiento__gte=timezone.now(),
        ).order_by("-fecha_vencimiento").first()

    @property
    def tiene_acceso(self):
        return self.activa and self.licencia_vigente is not None


class PlanLicencia(models.Model):
    class Meta:
        db_table = "plan_licencia"

    nombre = models.TextField()
    descripcion = models.TextField(null=True, blank=True)
    precio_mensual = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    duracion_meses = models.PositiveSmallIntegerField(default=0)
    duracion_dias = models.PositiveSmallIntegerField(default=0)

    max_citas_mes = models.IntegerField(null=True, blank=True)
    max_servicios = models.IntegerField(null=True, blank=True)
    max_usuarios_admin = models.IntegerField(null=True, blank=True)
    max_sucursales = models.IntegerField(default=1)

    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre


class LicenciaToken(models.Model):
    class Meta:
        db_table = "licencia_token"
        indexes = [
            models.Index(fields=["empresa", "estado"]),
            models.Index(fields=["fecha_vencimiento"]),
        ]

    ESTADO_CHOICES = [
        ("DISPONIBLE", "Disponible"),
        ("ACTIVA", "Activa"),
        ("VENCIDA", "Vencida"),
        ("SUSPENDIDA", "Suspendida"),
        ("CANCELADA", "Cancelada"),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="licencias")
    plan = models.ForeignKey(PlanLicencia, on_delete=models.SET_NULL, null=True, blank=True, related_name="licencias")
    token = models.CharField(max_length=128, unique=True, default=generar_token_licencia, editable=False)

    fecha_generacion = models.DateTimeField(auto_now_add=True)
    fecha_activacion = models.DateTimeField(null=True, blank=True)
    fecha_vencimiento = models.DateTimeField()
    estado = models.TextField(choices=ESTADO_CHOICES, default="DISPONIBLE")

    generada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="licencias_generadas",
    )

    def __str__(self):
        return f"{self.empresa_id} - {self.estado}"

    def clean(self):
        if self._state.adding and self.fecha_vencimiento and self.fecha_vencimiento <= timezone.now():
            raise ValidationError({"fecha_vencimiento": "La fecha de vencimiento debe estar en el futuro."})

    def actualizar_vencimiento(self, ahora=None):
        """Marca la licencia como vencida si terminó; retorna si hubo cambio."""
        ahora = ahora or timezone.now()
        if self.estado == "ACTIVA" and self.fecha_vencimiento < ahora:
            self.estado = "VENCIDA"
            self.save(update_fields=["estado"])
            return True
        return False

    @transaction.atomic
    def activar(self, ahora=None):
        ahora = ahora or timezone.now()
        if self.estado not in {"DISPONIBLE", "VENCIDA", "SUSPENDIDA"}:
            raise ValidationError("Sólo se puede activar una licencia disponible, vencida o suspendida.")
        if self.fecha_vencimiento <= ahora:
            raise ValidationError("No se puede activar una licencia ya vencida; renuévela primero.")
        self.estado = "ACTIVA"
        self.fecha_activacion = self.fecha_activacion or ahora
        self.save(update_fields=["estado", "fecha_activacion"])

    @transaction.atomic
    def renovar(self, meses, monto_pagado=Decimal("0.00"), observacion="", ahora=None):
        if meses <= 0:
            raise ValidationError({"meses": "La renovación debe agregar al menos un mes."})
        ahora = ahora or timezone.now()
        base = max(self.fecha_vencimiento, ahora)
        nueva_fecha = sumar_meses(base, meses)
        self.fecha_vencimiento = nueva_fecha
        self.fecha_activacion = self.fecha_activacion or ahora
        self.estado = "ACTIVA"
        self.save(update_fields=["fecha_vencimiento", "fecha_activacion", "estado"])
        return RenovacionLicencia.objects.create(
            licencia=self,
            meses_agregados=meses,
            nueva_fecha_vencimiento=nueva_fecha,
            monto_pagado=monto_pagado,
            observacion=observacion,
        )

    def suspender(self):
        if self.estado in {"CANCELADA", "VENCIDA"}:
            raise ValidationError("Una licencia cancelada o vencida no puede suspenderse.")
        self.estado = "SUSPENDIDA"
        self.save(update_fields=["estado"])

    def cancelar(self):
        self.estado = "CANCELADA"
        self.save(update_fields=["estado"])


class RenovacionLicencia(models.Model):
    class Meta:
        db_table = "renovacion_licencia"

    licencia = models.ForeignKey(LicenciaToken, on_delete=models.CASCADE, related_name="renovaciones")

    fecha_renovacion = models.DateTimeField(auto_now_add=True)
    meses_agregados = models.IntegerField()
    nueva_fecha_vencimiento = models.DateTimeField()
    monto_pagado = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    observacion = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Renovación #{self.id} ({self.licencia_id})"


class EventoEmpresa(models.Model):
    class Meta:
        db_table = "evento_empresa"

    TIPO_CHOICES = [
        ("GENERAL", "General"),
        ("LICENCIA", "Licencia"),
        ("PAGO", "Pago"),
        ("SOPORTE", "Soporte"),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="eventos")
    titulo = models.TextField()
    descripcion = models.TextField(null=True, blank=True)
    fecha = models.DateTimeField()
    tipo = models.TextField(choices=TIPO_CHOICES, default="GENERAL")
    completado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} ({self.empresa_id})"


class Sucursal(models.Model):
    class Meta:
        db_table = "sucursal"

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="sucursales")
    nombre = models.TextField()
    direccion = models.TextField(null=True, blank=True)
    telefono = models.TextField(null=True, blank=True)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.empresa_id})"


class ConfiguracionLanding(models.Model):
    class Meta:
        db_table = "configuracion_landing"

    empresa = models.OneToOneField(Empresa, on_delete=models.CASCADE, related_name="landing")
    titulo_hero = models.TextField(null=True, blank=True)
    subtitulo_hero = models.TextField(null=True, blank=True)
    imagen_hero_url = models.TextField(null=True, blank=True)
    texto_footer = models.TextField(null=True, blank=True)
    instagram_url = models.TextField(null=True, blank=True)
    facebook_url = models.TextField(null=True, blank=True)
    tiktok_url = models.TextField(null=True, blank=True)
    galeria_urls = models.JSONField(default=list, blank=True)
    mostrar_precios = models.BooleanField(default=True)
    fuente_titulos = models.TextField(default="Playfair Display")
    fuente_cuerpo = models.TextField(default="Poppins")
    fuente_script = models.TextField(default="Great Vibes")
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Landing de {self.empresa}"


class Cliente(models.Model):
    class Meta:
        db_table = "cliente"
        unique_together = ["empresa", "telefono"]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="clientes")
    nombre = models.TextField()
    telefono = models.TextField()
    email = models.TextField(null=True, blank=True)
    notas_internas = models.TextField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.telefono})"


class Cita(models.Model):
    class Meta:
        db_table = "cita"
        indexes = [
            models.Index(fields=["empresa", "fecha"]),
            models.Index(fields=["empresa", "estado"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["empresa", "sucursal", "fecha", "hora"],
                name="cita_unica_sucursal_horario",
            ),
        ]

    ESTADO_CHOICES = [
        ("PENDIENTE", "Pendiente"),
        ("CONFIRMADA", "Confirmada"),
        ("CANCELADA", "Cancelada"),
        ("COMPLETADA", "Completada"),
        ("NO_ASISTIO", "No Asistió"),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="citas")
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True, related_name="citas")
    servicio = models.ForeignKey("servicios.Servicio", on_delete=models.RESTRICT)
    cliente = models.ForeignKey(Cliente, on_delete=models.RESTRICT)
    fecha = models.DateField()
    hora = models.TimeField()
    precio_cobrado = models.DecimalField(max_digits=12, decimal_places=2)
    duracion_minutos = models.IntegerField()
    notas = models.TextField(null=True, blank=True)
    estado = models.TextField(choices=ESTADO_CHOICES, default="PENDIENTE")
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cita #{self.id} - {self.fecha} {self.hora}"
