from django.contrib import admin
from .models import Producto, MetodoPago, CajaDiaria, Venta, DetalleVenta, PagoVenta

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'sucursal', 'precio_venta', 'stock_actual', 'activo')
    list_filter = ('empresa', 'activo')
    search_fields = ('nombre', 'codigo_barras')

@admin.register(MetodoPago)
class MetodoPagoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'requiere_ref', 'activo')
    list_filter = ('empresa', 'activo')

class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 1

class PagoVentaInline(admin.TabularInline):
    model = PagoVenta
    extra = 1

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'empresa', 'sucursal', 'cliente', 'total', 'estado', 'fecha_emision')
    list_filter = ('empresa', 'estado', 'fecha_emision')
    inlines = [DetalleVentaInline, PagoVentaInline]

@admin.register(CajaDiaria)
class CajaDiariaAdmin(admin.ModelAdmin):
    list_display = ('id', 'empresa', 'sucursal', 'estado', 'usuario_abre', 'monto_inicial', 'fecha_apertura')
    list_filter = ('empresa', 'estado')