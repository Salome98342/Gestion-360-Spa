"""
Middlewares de seguridad complementarios.

Incluye:
  - SecurityHeadersMiddleware: añade cabeceras de seguridad que Django no
    genera por defecto (Content-Security-Policy y Permissions-Policy).
  - RateLimitMiddleware: limitador de peticiones en memoria, sin dependencias
    externas, para proteger los endpoints sensibles (login, reserva de citas y
    subida de imágenes) contra fuerza bruta y abuso.

NOTA sobre el rate limiter:
  - Es en memoria (por proceso), suficiente para un despliegue de un solo
    worker. Si se escala a múltiples workers/gunicorn, conviene migrarlo a
    Redis (p. ej. con ``django-ratelimit`` o un backend compartido).
"""

import time
from collections import defaultdict, deque


class SecurityHeadersMiddleware:
    """Añade cabeceras de seguridad adicionales a todas las respuestas."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data: https:; "
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
            "script-src 'self' https://cdnjs.cloudflare.com; "
            "font-src 'self' https://cdnjs.cloudflare.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        response["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), "
            "payment=(), usb=(), sync-xhr=()"
        )
        return response


class RateLimitMiddleware:
    """
    Limitador de peticiones en memoria (ventana deslizante por IP + ruta).

    Configurable vía settings:
      RATE_LIMIT_DEFAULT_MAX_REQUESTS  (int, por defecto 60)
      RATE_LIMIT_DEFAULT_SECONDS       (int, por defecto 60)
      RATE_LIMIT_RULES                 (dict ruta -> {"max": int, "seconds": int})
    """

    def __init__(self, get_response):
        self.get_response = get_response
        from django.conf import settings

        self.default_max = getattr(settings, "RATE_LIMIT_DEFAULT_MAX_REQUESTS", 60)
        self.default_seconds = getattr(settings, "RATE_LIMIT_DEFAULT_SECONDS", 60)
        self.rules = getattr(settings, "RATE_LIMIT_RULES", {})
        # estimación: almacenamos timestamps por (ip, ruta)
        self._hits = defaultdict(lambda: deque())

    def __call__(self, request):
        # Sólo limitamos métodos que modifican estado (POST/PUT/PATCH/DELETE)
        # y, aun así, sólo rutas configuradas o el límite por defecto.
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return self.get_response(request)

        path = request.path
        rule = None
        for prefix, cfg in self.rules.items():
            if path.startswith(prefix):
                rule = cfg
                break

        max_requests = (rule or {}).get("max", self.default_max)
        window_seconds = (rule or {}).get("seconds", self.default_seconds)

        ip = self._client_ip(request)
        key = (ip, path)
        now = time.monotonic()

        cola = self._hits[key]
        # Eliminamos entradas fuera de la ventana.
        while cola and now - cola[0] > window_seconds:
            cola.popleft()

        if len(cola) >= max_requests:
            from django.http import JsonResponse

            return JsonResponse(
                {"error": "Demasiadas peticiones. Intenta de nuevo en un momento."},
                status=429,
            )

        cola.append(now)
        return self.get_response(request)

    @staticmethod
    def _client_ip(request):
        # En producción detrás de un proxy inverso se debe usar cabecera
        # "X-Forwarded-For" de forma controlada (sólo el primer valor).
        return request.META.get("REMOTE_ADDR", "unknown")
