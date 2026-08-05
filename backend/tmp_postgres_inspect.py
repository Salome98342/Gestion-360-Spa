import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
try:
    django.setup()
except Exception as exc:
    print('django setup error', exc)
    raise

from django.db import connection
from django.conf import settings

print('DB settings:', connection.settings_dict)
print('ENGINE', connection.settings_dict.get('ENGINE'))
print('NAME', connection.settings_dict.get('NAME'))
print('HOST', connection.settings_dict.get('HOST'))
print('PORT', connection.settings_dict.get('PORT'))

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        print('db ping ok', cursor.fetchone())
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name LIMIT 20")
        tables = cursor.fetchall()
        print('tables:', tables)
except Exception as exc:
    print('db query error', exc)

try:
    from apps.empresas.models import Empresa, PlanLicencia, LicenciaToken, Sucursal, ConfiguracionLanding
    print('Models imported ok')
    print('Empresa count', Empresa.objects.count())
    for e in Empresa.objects.all()[:20]:
        print('empresa', e.id, e.nombre, e.slug, e.activa, e.tiene_acceso)
    print('Plan count', PlanLicencia.objects.count())
    for p in PlanLicencia.objects.all()[:20]:
        print('plan', p.id, p.nombre, p.precio_mensual)
    print('Licencia count', LicenciaToken.objects.count())
    for l in LicenciaToken.objects.all()[:20]:
        print('licencia', l.id, l.empresa_id, l.estado, l.fecha_vencimiento)
except Exception as exc:
    print('model query error', exc)
