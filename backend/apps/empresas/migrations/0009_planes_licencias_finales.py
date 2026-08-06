from decimal import Decimal

from django.db import migrations


def reemplazar_planes(apps, schema_editor):
    PlanLicencia = apps.get_model('empresas', 'PlanLicencia')
    # Las licencias existentes usan SET_NULL; no se eliminan ni se vencen.
    PlanLicencia.objects.all().delete()
    PlanLicencia.objects.bulk_create([
        PlanLicencia(nombre='Prueba gratis 1 mes', descripcion='Acceso gratuito por un mes.', precio_mensual=Decimal('0.00'), duracion_meses=1),
        PlanLicencia(nombre='Licencia mensual', descripcion='Licencia mensual de 30.000 pesos para el negocio.', precio_mensual=Decimal('30000.00'), duracion_meses=1),
        PlanLicencia(nombre='Prueba gratis 15 días', descripcion='Acceso gratuito por quince días.', precio_mensual=Decimal('0.00'), duracion_dias=15),
    ])


class Migration(migrations.Migration):
    dependencies = [('empresas', '0008_planes_duracion_y_planes_iniciales')]

    operations = [
        migrations.RunPython(reemplazar_planes, migrations.RunPython.noop),
    ]
