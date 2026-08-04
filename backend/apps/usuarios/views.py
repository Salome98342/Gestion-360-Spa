"""
apps/usuarios/views.py

Autenticación por sesión (cookie), pensada para que el panel /admin de
cada empresa haga login con usuario/clave reales en vez del Basic Auth
fijo que había en server.js.

Nota: estas vistas usan JsonResponse directo (sin Django REST Framework)
para no atarnos a una dependencia todavía. Si más adelante el frontend
crece (paginación, filtros, tokens para apps móviles, etc.) esto se migra
fácilmente a DRF sin cambiar la lógica de negocio, que vive en el modelo.
"""

import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator


def _usuario_a_dict(usuario):
    return {
        "id": usuario.id,
        "username": usuario.username,
        "nombre": usuario.get_full_name() or usuario.username,
        "email": usuario.email,
        "rol": usuario.rol,
        "es_staff_interno": usuario.es_staff_interno,
        "empresa_id": usuario.empresa_id,
        "empresa_nombre": usuario.empresa.nombre if usuario.empresa_id else None,
        "empresa_slug": usuario.empresa.slug if usuario.empresa_id else None,
    }


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(View):
    """GET /api/usuarios/csrf/ — inicializa la cookie CSRF para el frontend."""

    def get(self, request):
        return JsonResponse({"ok": True})


@method_decorator(ensure_csrf_cookie, name="dispatch")
class LoginView(View):
    """
    POST /api/usuarios/login/
    body: {"username": "...", "password": "..."}
    """

    def post(self, request):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido"}, status=400)

        username = (data.get("username") or "").strip()
        password = data.get("password") or ""

        if not username or not password:
            return JsonResponse({"error": "Usuario y contraseña son obligatorios"}, status=400)

        usuario = authenticate(request, username=username, password=password)
        if usuario is None:
            return JsonResponse({"error": "Credenciales inválidas"}, status=401)

        if not usuario.puede_administrar_empresa:
            return JsonResponse(
                {"error": "Este usuario no tiene acceso activo (revisa la licencia de la empresa)."},
                status=403,
            )

        login(request, usuario)
        return JsonResponse({"usuario": _usuario_a_dict(usuario)})


class LogoutView(View):
    """POST /api/usuarios/logout/"""

    def post(self, request):
        logout(request)
        return JsonResponse({"ok": True})


class MeView(View):
    """GET /api/usuarios/me/ — usado por el panel para saber quién está logueado."""

    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        return JsonResponse({"usuario": _usuario_a_dict(request.user)})
