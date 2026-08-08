"""
Django settings for config project.
"""

from pathlib import Path
import os
from django.core.exceptions import ImproperlyConfigured
try:
    from dotenv import load_dotenv

    load_dotenv()
except ModuleNotFoundError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
DEBUG = os.getenv('DJANGO_DEBUG', 'true').lower() in ('1', 'true', 'yes')

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    if DEBUG:
        # Útil sólo para el entorno local. En producción la variable es obligatoria.
        SECRET_KEY = 'django-insecure-development-only-change-me'
    else:
        raise ImproperlyConfigured('DJANGO_SECRET_KEY must be set in production')

ALLOWED_HOSTS = [host.strip() for host in os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if host.strip()]

# Orígenes de confianza para CSRF.
# El frontend (Vite en desarrollo) corre en localhost:5173 y, al pasar por el
# proxy con changeOrigin=true, el Origin que llega al backend puede ser
# http://127.0.0.1:8000. Se configuran ambos para cubrir los dos escenarios.
# En producción se define vía variable de entorno DJANGO_CSRF_TRUSTED_ORIGINS.
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        'DJANGO_CSRF_TRUSTED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000,http://192.168.1.13:5173',
    ).split(',')
    if origin.strip()
]

CSRF_COOKIE_SECURE = not os.getenv('DJANGO_DEBUG', 'true').lower() in ('1', 'true', 'yes')
SESSION_COOKIE_SECURE = not os.getenv('DJANGO_DEBUG', 'true').lower() in ('1', 'true', 'yes')
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_REFERRER_POLICY = 'same-origin'
SECURE_HSTS_SECONDS = 31536000 if not os.getenv('DJANGO_DEBUG', 'true').lower() in ('1', 'true', 'yes') else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not os.getenv('DJANGO_DEBUG', 'true').lower() in ('1', 'true', 'yes')
SECURE_HSTS_PRELOAD = not os.getenv('DJANGO_DEBUG', 'true').lower() in ('1', 'true', 'yes')

# Forzar HTTPS en producción (redirect automático). En desarrollo se desactiva.
# Si el despliegue está detrás de Nginx/Caddy que ya termina SSL, se debe
# confiar en la cabecera X-Forwarded-Proto para no romper el redirect.
SECURE_SSL_REDIRECT = not os.getenv('DJANGO_DEBUG', 'true').lower() in ('1', 'true', 'yes')
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ── Rate limiting (en memoria, ver config/middleware.py) ──
# Número máximo de peticiones mutantes permitidas por IP por ventana.
# Se establecen límites más estrictos en los endpoints sensibles.
RATE_LIMIT_DEFAULT_MAX_REQUESTS = 120
RATE_LIMIT_DEFAULT_SECONDS = 60
# OJO: el orden importa. El middleware elige la primera regla cuyo prefijo
# coincida, así que los prefijos más específicos deben ir primero.
RATE_LIMIT_RULES = {
    # Subida de imágenes: máx. 10 por IP cada minuto (anti abuso).
    "/api/empresas/configuracion/imagenes/": {"max": 10, "seconds": 60},
    # Login: máx. 10 intentos por IP cada 5 minutos (anti fuerza bruta).
    "/api/usuarios/login/": {"max": 10, "seconds": 300},
    # Endpoints de empresa (incluye reserva de citas pública): máx. 5 por IP
    # cada minuto (anti spam). Afecta sólo a métodos mutantes (POST/PUT/...).
    "/api/empresas/": {"max": 5, "seconds": 60},
}


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Apps propias del proyecto (backend/apps/<app>)
    'apps.empresas',
    'apps.servicios',
    'apps.usuarios',
    'apps.ventas',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # Middlewares de seguridad propios (config/middleware.py)
    'config.middleware.SecurityHeadersMiddleware',
    'config.middleware.RateLimitMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases
# OJO: antes estaba definido DOS VECES en este archivo (Postgres y luego
# SQLite pisándolo). Debe existir un único diccionario DATABASES.

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
        'OPTIONS': {
            'options': '-c search_path=public'
        },
    }
}


# Modelo de usuario personalizado (apps/usuarios/models.py -> Usuario)
# El app_label es "usuarios" (última parte de name="apps.usuarios" en
# apps/usuarios/apps.py), NO "apps.usuarios".
AUTH_USER_MODEL = 'usuarios.Usuario'


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
LANGUAGE_CODE = 'es-co'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Archivos subidos por cada empresa.  Se deja fuera del c\u00f3digo del frontend
# para que las im\u00e1genes no se pierdan al generar una nueva compilaci\u00f3n.
IMAGES_ROOT = BASE_DIR.parent / 'images'
IMAGES_URL = '/images/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
