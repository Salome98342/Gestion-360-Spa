"""API pública para el landing y el agendador de cada empresa."""

import json
from datetime import date, time
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views import View

from apps.servicios.models import Servicio

from .models import Cita, Cliente, ConfiguracionLanding, Empresa, Sucursal


def _landing_a_dict(empresa, landing):
    return {
        "empresa": {
            "nombre": empresa.nombre, "slug": empresa.slug, "telefono": empresa.telefono,
            "whatsapp": empresa.whatsapp, "logo_url": empresa.logo_url,
            "color_primario": empresa.color_primario, "color_secundario": empresa.color_secundario,
        },
        "landing": {
            "titulo_hero": landing.titulo_hero, "subtitulo_hero": landing.subtitulo_hero,
            "imagen_hero_url": landing.imagen_hero_url, "texto_footer": landing.texto_footer,
            "instagram_url": landing.instagram_url, "facebook_url": landing.facebook_url,
            "tiktok_url": landing.tiktok_url, "galeria_urls": landing.galeria_urls,
            "mostrar_precios": landing.mostrar_precios,
        },
    }


class LandingPublicaView(View):
    """GET /api/empresas/<slug>/landing/."""

    def get(self, request, slug):
        empresa = get_object_or_404(Empresa, slug=slug, activa=True)
        if not empresa.tiene_acceso:
            return JsonResponse({"error": "La empresa no tiene el servicio activo"}, status=403)

        landing, _ = ConfiguracionLanding.objects.get_or_create(empresa=empresa)
        servicios = Servicio.objects.filter(empresa=empresa, activo=True).order_by("orden", "nombre")
        return JsonResponse({
            **_landing_a_dict(empresa, landing),
            "sucursales": [{"id": s.id, "nombre": s.nombre, "direccion": s.direccion, "telefono": s.telefono}
                           for s in empresa.sucursales.filter(activa=True).order_by("nombre")],
            "servicios": [{
                "id": s.id, "sucursal_id": s.sucursal_id, "nombre": s.nombre,
                "duracion_minutos": s.duracion_minutos, "precio": str(s.precio),
                "descripcion": s.descripcion, "icono": s.icono,
            } for s in servicios],
        })


class ConfiguracionLandingView(View):
    """Configuración del landing para el dueño de la empresa en sesión."""

    def dispatch(self, request, *args, **kwargs):
        usuario = request.user
        if not usuario.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        if not usuario.empresa_id or usuario.rol != "DUENO":
            return JsonResponse({"error": "Sólo el dueño de la empresa puede editar el landing"}, status=403)
        if not usuario.puede_administrar_empresa:
            return JsonResponse({"error": "La licencia de la empresa no está activa"}, status=403)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        landing, _ = ConfiguracionLanding.objects.get_or_create(empresa=request.user.empresa)
        return JsonResponse(_landing_a_dict(request.user.empresa, landing))

    def patch(self, request):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido"}, status=400)

        empresa = request.user.empresa
        landing, _ = ConfiguracionLanding.objects.get_or_create(empresa=empresa)
        empresa_fields = {"nombre", "telefono", "whatsapp", "logo_url", "color_primario", "color_secundario"}
        landing_fields = {
            "titulo_hero", "subtitulo_hero", "imagen_hero_url", "texto_footer",
            "instagram_url", "facebook_url", "tiktok_url", "mostrar_precios", "galeria_urls",
        }
        for field in empresa_fields & data.keys():
            setattr(empresa, field, data[field])
        for field in landing_fields & data.keys():
            setattr(landing, field, data[field])
        if "galeria_urls" in data and (not isinstance(data["galeria_urls"], list) or not all(isinstance(url, str) for url in data["galeria_urls"])):
            return JsonResponse({"error": "galeria_urls debe ser una lista de URL"}, status=400)
        empresa.full_clean()
        landing.full_clean()
        empresa.save()
        landing.save()
        return JsonResponse(_landing_a_dict(empresa, landing))


class ReservarCitaView(View):
    """POST /api/empresas/<slug>/citas/ para reservar desde el landing."""

    def post(self, request, slug):
        empresa = get_object_or_404(Empresa, slug=slug, activa=True)
        if not empresa.tiene_acceso:
            return JsonResponse({"error": "La empresa no tiene el servicio activo"}, status=403)
        try:
            data = json.loads(request.body or "{}")
            fecha = date.fromisoformat(data["fecha"])
            hora = time.fromisoformat(data["hora"])
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            return JsonResponse({"error": "Datos inválidos; fecha YYYY-MM-DD y hora HH:MM son obligatorias"}, status=400)

        nombre, telefono = (data.get("nombre") or "").strip(), (data.get("telefono") or "").strip()
        if not nombre or not telefono:
            return JsonResponse({"error": "Nombre y teléfono son obligatorios"}, status=400)
        if fecha < timezone.localdate():
            return JsonResponse({"error": "No puede reservar una fecha pasada"}, status=400)

        servicio = get_object_or_404(Servicio, id=data.get("servicio_id"), empresa=empresa, activo=True)
        sucursal = get_object_or_404(Sucursal, id=data.get("sucursal_id"), empresa=empresa, activa=True)
        if servicio.sucursal_id and servicio.sucursal_id != sucursal.id:
            return JsonResponse({"error": "El servicio no está disponible en esa sucursal"}, status=400)

        try:
            with transaction.atomic():
                cliente, _ = Cliente.objects.get_or_create(
                    empresa=empresa, telefono=telefono,
                    defaults={"nombre": nombre, "email": (data.get("email") or "").strip() or None},
                )
                cita = Cita.objects.create(
                    empresa=empresa, sucursal=sucursal, servicio=servicio, cliente=cliente,
                    fecha=fecha, hora=hora, precio_cobrado=Decimal(servicio.precio),
                    duracion_minutos=servicio.duracion_minutos,
                    notas=(data.get("notas") or "").strip() or None,
                )
        except IntegrityError:
            return JsonResponse({"error": "Ese horario ya no está disponible"}, status=409)

        return JsonResponse({"cita": {
            "id": cita.id, "fecha": cita.fecha.isoformat(), "hora": cita.hora.isoformat(),
            "estado": cita.estado, "servicio": servicio.nombre, "sucursal": sucursal.nombre,
        }}, status=201)
