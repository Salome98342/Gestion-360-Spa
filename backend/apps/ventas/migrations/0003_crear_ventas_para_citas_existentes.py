from django.db import migrations


def crear_ventas_para_citas_existentes(apps, schema_editor):
    Cita = apps.get_model('empresas', 'Cita')
    Venta = apps.get_model('ventas', 'Venta')
    DetalleVenta = apps.get_model('ventas', 'DetalleVenta')
    Usuario = apps.get_model('usuarios', 'Usuario')

    for cita in Cita.objects.select_related('servicio', 'cliente').all():
        if Venta.objects.filter(cita_id=cita.id).exists():
            continue
        vendedor = Usuario.objects.filter(
            empresa_id=cita.empresa_id, rol='DUENO', is_active=True,
        ).order_by('id').first()
        if not vendedor:
            continue
        venta = Venta.objects.create(
            empresa_id=cita.empresa_id,
            sucursal_id=None,
            cliente_id=cita.cliente_id,
            cita_id=cita.id,
            vendedor_id=vendedor.id,
            subtotal=cita.precio_cobrado,
            total=cita.precio_cobrado,
            estado='PENDIENTE',
        )
        DetalleVenta.objects.create(
            venta_id=venta.id,
            servicio_id=cita.servicio_id,
            descripcion=cita.servicio.nombre,
            cantidad=1,
            precio_unitario=cita.precio_cobrado,
            subtotal=cita.precio_cobrado,
        )


class Migration(migrations.Migration):
    dependencies = [('ventas', '0002_venta_sucursal_opcional')]

    operations = [migrations.RunPython(crear_ventas_para_citas_existentes, migrations.RunPython.noop)]
