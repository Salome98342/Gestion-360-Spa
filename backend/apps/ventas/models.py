from decimal import Decimal

from django.conf import settings
from django.db import models


class Producto(models.Model):
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE, related_name='productos')
    sucursal = models.ForeignKey('empresas.Sucursal', on_delete=models.CASCADE, null=True, blank=True, related_name='productos')
    nombre = models.TextField()
    codigo_barras = models.TextField(null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    precio_venta = models.DecimalField(max_digits=12, decimal_places=2)
    costo = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    stock_actual = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'producto'
        indexes = [models.Index(fields=['empresa'])]

    def __str__(self):
        return self.nombre


class MetodoPago(models.Model):
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE, related_name='metodos_pago')
    nombre = models.TextField()
    requiere_ref = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'metodo_pago'

    def __str__(self):
        return f"{self.nombre} ({self.empresa.nombre})"


class CajaDiaria(models.Model):
    ESTADOS = [
        ('ABIERTA', 'Abierta'),
        ('CERRADA', 'Cerrada'),
        ('CUADRADA', 'Cuadrada'),
        ('DESCUADRE', 'Descuadre'),
    ]
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE, related_name='cajas')
    sucursal = models.ForeignKey('empresas.Sucursal', on_delete=models.CASCADE, related_name='cajas')
    usuario_abre = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, related_name='cajas_abiertas')
    usuario_cierra = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, null=True, blank=True, related_name='cajas_cerradas')
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    monto_inicial = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    monto_final_calc = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    monto_final_real = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    estado = models.CharField(max_length=20, choices=ESTADOS, default='ABIERTA')
    observaciones = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'caja_diaria'


class Venta(models.Model):
    ESTADOS = [
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADA', 'Completada'),
        ('ANULADA', 'Anulada'),
    ]
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE, related_name='ventas')
    sucursal = models.ForeignKey('empresas.Sucursal', on_delete=models.CASCADE, related_name='ventas')
    caja_diaria = models.ForeignKey(CajaDiaria, on_delete=models.RESTRICT, null=True, blank=True, related_name='ventas')
    cliente = models.ForeignKey('empresas.Cliente', on_delete=models.SET_NULL, null=True, blank=True)
    cita = models.ForeignKey('empresas.Cita', on_delete=models.SET_NULL, null=True, blank=True, related_name='ventas')
    vendedor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT)
    fecha_emision = models.DateTimeField(auto_now_add=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    impuestos = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    descuento = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    estado = models.CharField(max_length=20, choices=ESTADOS, default='COMPLETADA')
    creada_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'venta'
        indexes = [models.Index(fields=['empresa', 'fecha_emision'])]


class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    servicio = models.ForeignKey('servicios.Servicio', on_delete=models.SET_NULL, null=True, blank=True)
    producto = models.ForeignKey(Producto, on_delete=models.SET_NULL, null=True, blank=True)
    descripcion = models.TextField()  # Snapshot del nombre del prod/serv
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'detalle_venta'


class PagoVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='pagos')
    metodo_pago = models.ForeignKey(MetodoPago, on_delete=models.RESTRICT)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    referencia = models.TextField(null=True, blank=True)
    fecha_pago = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pago_venta'
