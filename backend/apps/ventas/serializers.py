from rest_framework import serializers
from .models import Producto, Venta, DetalleVenta, PagoVenta, CajaDiaria

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'

class DetalleVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = ['id', 'servicio', 'producto', 'descripcion', 'cantidad', 'precio_unitario', 'subtotal']

class PagoVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PagoVenta
        fields = ['id', 'metodo_pago', 'monto', 'referencia']

class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    pagos = PagoVentaSerializer(many=True, read_only=True)

    class Meta:
        model = Venta
        fields = [
            'id', 'empresa', 'sucursal', 'caja_diaria', 'cliente', 'cita', 
            'vendedor', 'fecha_emision', 'subtotal', 'impuestos', 'descuento', 
            'total', 'estado', 'detalles', 'pagos'
        ]