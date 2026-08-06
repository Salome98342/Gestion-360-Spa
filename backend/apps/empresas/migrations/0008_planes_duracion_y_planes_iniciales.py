from decimal import Decimal

from django.db import migrations, models


def reemplazar_planes(apps, schema_editor):
    PlanLicencia = apps.get_model('empresas', 'PlanLicencia')
    # Las licencias existentes usan SET_NULL; no se eliminan ni se vencen.
    PlanLicencia.objects.all().delete()
    PlanLicencia.objects.bulk_create([
        PlanLicencia(nombre='Prueba gratis 1 mes', descripcion='Acceso gratuito por un mes.', precio_mensual=Decimal('0.00'), duracion_meses=1),
        PlanLicencia(nombre='Plan mensual', descripcion='Licencia mensual para el negocio.', precio_mensual=Decimal('30000.00'), duracion_meses=1),
        PlanLicencia(nombre='Prueba gratis 15 días', descripcion='Acceso gratuito por quince días.', precio_mensual=Decimal('0.00'), duracion_dias=15),
    ])


class Migration(migrations.Migration):
    dependencies = [('empresas', '0007_empresa_colores_marca')]

    operations = [
        migrations.AddField(model_name='planlicencia', name='duracion_meses', field=models.PositiveSmallIntegerField(default=0)),
        migrations.AddField(model_name='planlicencia', name='duracion_dias', field=models.PositiveSmallIntegerField(default=0)),
        migrations.RunPython(reemplazar_planes, migrations.RunPython.noop),
    ]
