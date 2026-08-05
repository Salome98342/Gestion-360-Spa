import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.empresas.models import Empresa, PlanLicencia, LicenciaToken, Sucursal, ConfiguracionLanding
from apps.usuarios.models import Usuario

now = timezone.now()

print('Creating sample plans...')
plan_prueba, _ = PlanLicencia.objects.get_or_create(
    nombre='Prueba 14 días',
    defaults={
        'descripcion': 'Plan de prueba gratuito por 14 días.',
        'precio_mensual': 0,
        'max_citas_mes': 100,
        'max_servicios': 20,
        'max_usuarios_admin': 3,
        'max_sucursales': 2,
        'activo': True,
    }
)
plan_premium, _ = PlanLicencia.objects.get_or_create(
    nombre='Premium',
    defaults={
        'descripcion': 'Plan premium con capacidades completas.',
        'precio_mensual': 120000,
        'max_citas_mes': 1000,
        'max_servicios': 50,
        'max_usuarios_admin': 10,
        'max_sucursales': 5,
        'activo': True,
    }
)

print('Creating sample companies...')
companies = [
    {
        'nombre': 'Glow Spa Centro',
        'slug': 'glow-spa',
        'telefono': '+57 300 123 4567',
        'whatsapp': '+57 300 123 4567',
        'activa': True,
        'plan': plan_prueba,
        'titulo_hero': 'Bienvenido a Glow Spa',
        'subtitulo_hero': 'Relájate y renueva tu energía con nuestros tratamientos.',
        'imagen_hero_url': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1100&q=85',
        'texto_footer': 'Glow Spa - Tu refugio de bienestar.',
        'instagram_url': 'https://instagram.com/glowspa',
        'facebook_url': 'https://facebook.com/glowspa',
        'tiktok_url': 'https://www.tiktok.com/@glowspa',
        'galeria_urls': [
            'https://images.unsplash.com/photo-1556228724-4dc2bc60cc47?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1535023330385-7b4c5ef81405?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522336572468-7a2c6d8f35c7?auto=format&fit=crop&w=800&q=80',
        ],
    },
    {
        'nombre': 'Uñas Express',
        'slug': 'unas-express',
        'telefono': '+57 310 765 4321',
        'whatsapp': '+57 310 765 4321',
        'activa': True,
        'plan': plan_premium,
        'titulo_hero': 'Uñas Express',
        'subtitulo_hero': 'Estética profesional y rápida para tus manos y pies.',
        'imagen_hero_url': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1100&q=85',
        'texto_footer': 'Uñas Express - Belleza al instante.',
        'instagram_url': 'https://instagram.com/unasexpress',
        'facebook_url': 'https://facebook.com/unasexpress',
        'tiktok_url': 'https://www.tiktok.com/@unasexpress',
        'galeria_urls': [
            'https://images.unsplash.com/photo-1514630962678-8c40a7d05f34?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522336572468-7a2c6d8f35c7?auto=format&fit=crop&w=800&q=80',
        ],
    },
]

for data in companies:
    empresa, created = Empresa.objects.get_or_create(
        slug=data['slug'],
        defaults={
            'nombre': data['nombre'],
            'telefono': data['telefono'],
            'whatsapp': data['whatsapp'],
            'activa': data['activa'],
        }
    )
    if created:
        print('Created company', empresa.slug)
    else:
        print('Existing company', empresa.slug)

    landing, _ = ConfiguracionLanding.objects.get_or_create(
        empresa=empresa,
        defaults={
            'titulo_hero': data['titulo_hero'],
            'subtitulo_hero': data['subtitulo_hero'],
            'imagen_hero_url': data['imagen_hero_url'],
            'texto_footer': data['texto_footer'],
            'instagram_url': data['instagram_url'],
            'facebook_url': data['facebook_url'],
            'tiktok_url': data['tiktok_url'],
            'galeria_urls': data['galeria_urls'],
            'mostrar_precios': True,
        }
    )

    if not LicenciaToken.objects.filter(empresa=empresa, estado='ACTIVA').exists():
        LicenciaToken.objects.create(
            empresa=empresa,
            plan=data['plan'],
            fecha_vencimiento=now + timedelta(days=30),
            fecha_activacion=now,
            estado='ACTIVA',
        )
        print('Created active license for', empresa.slug)

    if not Sucursal.objects.filter(empresa=empresa, nombre='Sucursal Principal').exists():
        Sucursal.objects.create(
            empresa=empresa,
            nombre='Sucursal Principal',
            direccion='Calle 123 #45-67',
            telefono=data['telefono'],
            activa=True,
        )
        print('Created branch for', empresa.slug)

print('Creating sample users...')
users = [
    {'username': 'dueno_glow', 'password': 'Clave1234!', 'rol': 'DUENO', 'empresa_slug': 'glow-spa'},
    {'username': 'dueno_unas', 'password': 'Clave1234!', 'rol': 'DUENO', 'empresa_slug': 'unas-express'},
]

for user_data in users:
    empresa = Empresa.objects.filter(slug=user_data['empresa_slug']).first()
    if not empresa:
        print('Missing company for user', user_data['username'])
        continue
    usuario, created = Usuario.objects.get_or_create(
        username=user_data['username'],
        defaults={
            'email': f"{user_data['username']}@example.com",
            'rol': user_data['rol'],
            'empresa': empresa,
            'is_staff': False,
            'is_active': True,
        }
    )
    if created:
        usuario.set_password(user_data['password'])
        usuario.save()
        print('Created user', usuario.username)
    else:
        print('Existing user', usuario.username)

print('Done.')
