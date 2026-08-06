"""API pública para el landing y el agendador de cada empresa."""

import json
import uuid
from datetime import date, datetime, time
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.core.files.storage import FileSystemStorage
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views import View

from apps.servicios.models import DiaExcepcion, HorarioAtencion, Servicio

from .models import (
    Cita,
    Cliente,
    ConfiguracionLanding,
    Empresa,
    LicenciaToken,
    PlanLicencia,
    Sucursal,
)


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
        try:
            empresa.full_clean()
            landing.full_clean()
        except ValidationError as exc:
            return JsonResponse({"error": "Datos inválidos", "detalles": exc.message_dict}, status=400)
        empresa.save()
        landing.save()
        return JsonResponse(_landing_a_dict(empresa, landing))


class ImagenEmpresaUploadView(View):
    """Recibe una imagen optimizada desde el panel del due\u00f1o."""

    MAX_SIZE_BYTES = 1 * 1024 * 1024
    ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}

    @staticmethod
    def _es_imagen_valida(archivo, content_type):
        encabezado = archivo.read(16)
        archivo.seek(0)
        firmas = {
            "image/jpeg": encabezado.startswith(b"\xff\xd8\xff"),
            "image/png": encabezado.startswith(b"\x89PNG\r\n\x1a\n"),
            "image/webp": encabezado.startswith(b"RIFF") and encabezado[8:12] == b"WEBP",
        }
        return firmas.get(content_type, False)

    def dispatch(self, request, *args, **kwargs):
        usuario = request.user
        if not usuario.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        if not usuario.empresa_id or usuario.rol != "DUENO":
            return JsonResponse({"error": "S\u00f3lo el due\u00f1o de la empresa puede subir im\u00e1genes"}, status=403)
        if not usuario.puede_administrar_empresa:
            return JsonResponse({"error": "La licencia de la empresa no est\u00e1 activa"}, status=403)
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        archivo = request.FILES.get("imagen")
        if not archivo:
            return JsonResponse({"error": "Debes seleccionar una imagen."}, status=400)
        if archivo.content_type not in self.ALLOWED_TYPES:
            return JsonResponse({"error": "S\u00f3lo se permiten im\u00e1genes JPG, PNG o WEBP."}, status=400)
        if not self._es_imagen_valida(archivo, archivo.content_type):
            return JsonResponse({"error": "El archivo no contiene una imagen v\u00e1lida."}, status=400)
        if archivo.size > self.MAX_SIZE_BYTES:
            return JsonResponse({"error": "La imagen optimizada no puede superar 1 MB."}, status=400)

        # El slug es el identificador seguro y estable del nombre de empresa.
        empresa = request.user.empresa
        carpeta_empresa = Path(settings.IMAGES_ROOT) / empresa.slug
        carpeta_empresa.mkdir(parents=True, exist_ok=True)
        extension = self.ALLOWED_TYPES[archivo.content_type]
        nombre = f"{uuid.uuid4().hex}{extension}"
        storage = FileSystemStorage(location=carpeta_empresa, base_url=f"{settings.IMAGES_URL}{empresa.slug}/")
        guardado = storage.save(nombre, archivo)
        return JsonResponse({"url": storage.url(guardado) + f"?v={uuid.uuid4().hex[:8]}"}, status=201)


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

        servicio_id = data.get("servicio_id")
        sucursal_id = data.get("sucursal_id")
        if not servicio_id or not sucursal_id:
            return JsonResponse({"error": "servicio_id y sucursal_id son obligatorios"}, status=400)

        try:
            servicio = Servicio.objects.get(id=servicio_id, empresa=empresa, activo=True)
        except Servicio.DoesNotExist:
            return JsonResponse({"error": "Servicio no encontrado"}, status=404)
        try:
            sucursal = Sucursal.objects.get(id=sucursal_id, empresa=empresa, activa=True)
        except Sucursal.DoesNotExist:
            return JsonResponse({"error": "Sucursal no encontrada"}, status=404)

        if servicio.sucursal_id and servicio.sucursal_id != sucursal.id:
            return JsonResponse({"error": "El servicio no está disponible en esa sucursal"}, status=400)

        # Validar horario de atención y días de excepción.
        dia_semana = fecha.weekday()  # 0=lunes ... 6=domingo
        horario = HorarioAtencion.objects.filter(
            empresa=empresa,
            sucursal=sucursal,
            dia_semana=dia_semana,
            activo=True,
        ).first()
        if not horario:
            return JsonResponse({"error": "La sucursal no atiende ese día de la semana"}, status=400)

        excepcion = DiaExcepcion.objects.filter(
            empresa=empresa,
            fecha=fecha,
        ).filter(sucursal=sucursal).first()
        if not excepcion:
            excepcion = DiaExcepcion.objects.filter(
                empresa=empresa,
                fecha=fecha,
                sucursal__isnull=True,
            ).first()
        if excepcion:
            if excepcion.cerrado_todo_dia:
                return JsonResponse({"error": "La sucursal está cerrada ese día"}, status=400)
            if excepcion.hora_inicio and excepcion.hora_fin:
                if not (excepcion.hora_inicio <= hora <= excepcion.hora_fin):
                    return JsonResponse({"error": "El horario no está disponible por una excepción"}, status=400)

        if not (horario.hora_inicio <= hora < horario.hora_fin):
            return JsonResponse({"error": "La hora está fuera del horario de atención"}, status=400)

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


def _empresa_superadmin_a_dict(empresa):
    # La consola SaaS debe ver también la última licencia suspendida o vencida
    # para poder renovarla o reactivarla.
    licencia = empresa.licencia_vigente or empresa.licencias.order_by("-fecha_vencimiento").first()
    propietario = empresa.usuarios.filter(rol="DUENO", is_active=True).order_by("id").first()
    return {
        "id": empresa.id,
        "nombre": empresa.nombre,
        "slug": empresa.slug,
        "telefono": empresa.telefono,
        "whatsapp": empresa.whatsapp,
        "activo": empresa.activa,
        "tiene_acceso": empresa.tiene_acceso,
        "licencia": {
            "id": licencia.id if licencia else None,
            "estado": licencia.estado if licencia else None,
            "plan": licencia.plan.nombre if licencia and licencia.plan else None,
            "fecha_vencimiento": licencia.fecha_vencimiento.isoformat() if licencia else None,
        },
        "propietario": {
            "id": propietario.id,
            "username": propietario.username,
            "nombre": propietario.get_full_name() or propietario.username,
            "email": propietario.email,
        } if propietario else None,
    }


def _plan_a_dict(plan):
    return {
        "id": plan.id,
        "nombre": plan.nombre,
        "descripcion": plan.descripcion,
        "precio_mensual": str(plan.precio_mensual),
        "max_citas_mes": plan.max_citas_mes,
        "max_servicios": plan.max_servicios,
        "max_usuarios_admin": plan.max_usuarios_admin,
        "max_sucursales": plan.max_sucursales,
    }


class SuperAdminEmpresaListCreateView(LoginRequiredMixin, UserPassesTestMixin, View):
    """Gestión de empresas y licencias. Sólo accesible para staff interno."""

    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.es_staff_interno

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        return JsonResponse({"error": "No autorizado; sólo staff interno"}, status=403)

    def get(self, request):
        empresas = Empresa.objects.all().order_by("nombre")
        return JsonResponse({"empresas": [_empresa_superadmin_a_dict(e) for e in empresas]})

    def post(self, request):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido"}, status=400)

        nombre = (data.get("nombre") or "").strip()
        slug = (data.get("slug") or "").strip()
        username = (data.get("admin_username") or "").strip()
        password = data.get("admin_password") or ""
        if not nombre or not slug or not username or not password:
            return JsonResponse({"error": "Nombre, slug, usuario y contraseña de la propietaria son obligatorios."}, status=400)
        if len(password) < 8:
            return JsonResponse({"error": "La contraseña debe tener al menos 8 caracteres."}, status=400)
        if Empresa.objects.filter(slug=slug).exists():
            return JsonResponse({"error": "Ya existe una empresa con ese slug."}, status=400)
        Usuario = get_user_model()
        if Usuario.objects.filter(username=username).exists():
            return JsonResponse({"error": "Ese usuario ya está en uso."}, status=400)

        fecha_vencimiento = data.get("fecha_vencimiento")
        try:
            fecha = date.fromisoformat(fecha_vencimiento)
        except (TypeError, ValueError):
            return JsonResponse({"error": "fecha_vencimiento debe tener formato YYYY-MM-DD."}, status=400)

        plan_id = data.get("plan_id")
        plan = None
        if plan_id is not None and plan_id != "":
            try:
                plan = PlanLicencia.objects.get(id=int(plan_id), activo=True)
            except (ValueError, PlanLicencia.DoesNotExist):
                return JsonResponse({"error": "Plan de licencia inválido."}, status=400)

        fecha_vencimiento_dt = timezone.make_aware(datetime.combine(fecha, time(23, 59, 59)))
        if fecha_vencimiento_dt <= timezone.now():
            return JsonResponse({"error": "La fecha de vencimiento debe ser futura."}, status=400)

        with transaction.atomic():
            empresa = Empresa.objects.create(
                nombre=nombre,
                slug=slug,
                telefono=(data.get("telefono") or "").strip() or None,
                whatsapp=(data.get("whatsapp") or "").strip() or None,
                activa=True,
            )
            LicenciaToken.objects.create(
                empresa=empresa,
                plan=plan,
                fecha_vencimiento=fecha_vencimiento_dt,
                fecha_activacion=timezone.now(),
                estado="ACTIVA",
            )
            propietario = Usuario(
                username=username,
                first_name=(data.get("admin_nombre") or "").strip(),
                email=(data.get("admin_email") or "").strip(),
                empresa=empresa,
                rol="DUENO",
                is_active=True,
            )
            propietario.set_password(password)
            propietario.save()

        # Se crea desde el alta, aunque a\u00fan no se haya cargado ning\u00fan archivo.
        (Path(settings.IMAGES_ROOT) / empresa.slug).mkdir(parents=True, exist_ok=True)

        return JsonResponse(_empresa_superadmin_a_dict(empresa), status=201)


class CuentaPropietarioView(LoginRequiredMixin, UserPassesTestMixin, View):
    """Restablece la contraseña de la cuenta dueña de un negocio."""

    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.es_staff_interno

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        return JsonResponse({"error": "No autorizado; sólo staff interno"}, status=403)

    def post(self, request, pk):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido"}, status=400)

        password = data.get("password") or ""
        if len(password) < 8:
            return JsonResponse({"error": "La contraseña debe tener al menos 8 caracteres."}, status=400)

        empresa = get_object_or_404(Empresa, pk=pk)
        propietario = empresa.usuarios.filter(rol="DUENO", is_active=True).order_by("id").first()
        if not propietario:
            return JsonResponse({"error": "Esta empresa no tiene una cuenta propietaria activa."}, status=404)

        propietario.set_password(password)
        propietario.save(update_fields=["password"])
        return JsonResponse({"ok": True, "username": propietario.username})


class EmpresaDetalleSuperAdminView(LoginRequiredMixin, UserPassesTestMixin, View):
    """Ficha y edición de datos comerciales de un negocio para el SaaS."""

    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.es_staff_interno

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        return JsonResponse({"error": "No autorizado; sólo staff interno"}, status=403)

    def get(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)
        return JsonResponse({
            **_empresa_superadmin_a_dict(empresa),
            "nit": empresa.nit,
            "direccion": empresa.direccion,
            "email_contacto": empresa.email_contacto,
            "moneda": empresa.moneda,
            "porcentaje_impuesto": str(empresa.porcentaje_impuesto),
            "creada_en": empresa.creada_en.isoformat(),
        })

    def patch(self, request, pk):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido"}, status=400)
        empresa = get_object_or_404(Empresa, pk=pk)
        editable = {"nombre", "slug", "telefono", "whatsapp", "nit", "direccion", "email_contacto", "moneda", "porcentaje_impuesto", "activa"}
        if "slug" in data:
            slug = (data["slug"] or "").strip()
            if not slug:
                return JsonResponse({"error": "El slug no puede estar vacío."}, status=400)
            if Empresa.objects.exclude(pk=empresa.pk).filter(slug=slug).exists():
                return JsonResponse({"error": "Ese slug ya está en uso."}, status=400)
        for field in editable & data.keys():
            value = data[field]
            if field in {"nombre", "slug", "telefono", "whatsapp", "nit", "direccion", "email_contacto", "moneda"} and isinstance(value, str):
                value = value.strip() or None
            setattr(empresa, field, value)
        try:
            empresa.full_clean()
        except ValidationError as exc:
            return JsonResponse({"error": "Datos inválidos", "detalles": exc.message_dict}, status=400)
        empresa.save()
        return self.get(request, pk)


class PlanLicenciaListView(LoginRequiredMixin, UserPassesTestMixin, View):
    """Listado de planes de licencia. Sólo accesible para staff interno."""

    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.es_staff_interno

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        return JsonResponse({"error": "No autorizado; sólo staff interno"}, status=403)

    def get(self, request):
        planes = PlanLicencia.objects.filter(activo=True).order_by("precio_mensual", "nombre")
        return JsonResponse({"planes": [_plan_a_dict(plan) for plan in planes]})


class LicenciaAccionView(LoginRequiredMixin, UserPassesTestMixin, View):
    """Acciones sobre licencias (renovar/suspender/cancelar/activar).

    Sólo accesible para staff interno.
    """

    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.es_staff_interno

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        return JsonResponse({"error": "No autorizado; sólo staff interno"}, status=403)

    def _get_licencia(self, pk):
        return get_object_or_404(LicenciaToken, pk=pk)

    def post(self, request, pk, accion):
        licencia = self._get_licencia(pk)

        body = {}
        if request.body:
            try:
                body = json.loads(request.body or "{}")
            except json.JSONDecodeError:
                return JsonResponse({"error": "JSON inválido"}, status=400)

        try:
            if accion == "renovar":
                try:
                    meses = int(body.get("meses", 0))
                    monto = str(body.get("monto", "0.00"))
                except (TypeError, ValueError):
                    return JsonResponse({"error": "meses y monto deben ser valores válidos"}, status=400)
                if meses <= 0:
                    return JsonResponse({"error": "meses debe ser mayor a 0"}, status=400)
                licencia.renovar(meses, monto_pagado=Decimal(monto))
            elif accion == "suspender":
                licencia.suspender()
            elif accion == "cancelar":
                licencia.cancelar()
            elif accion == "activar":
                licencia.activar()
            else:
                return JsonResponse({"error": "Acción no válida"}, status=400)
        except ValidationError as exc:
            return JsonResponse({"error": str(exc)}, status=400)

        return JsonResponse({
            "licencia_id": licencia.id,
            "empresa_id": licencia.empresa_id,
            "estado": licencia.estado,
            "fecha_vencimiento": licencia.fecha_vencimiento.isoformat(),
        })
