import json
from decimal import Decimal, InvalidOperation

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View

from .models import Servicio


class EmpresaAutenticadaView(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        if not request.user.empresa_id:
            return JsonResponse({"error": "Este endpoint requiere una empresa asignada"}, status=403)
        if not request.user.puede_administrar_empresa:
            return JsonResponse({"error": "La empresa no tiene una licencia activa"}, status=403)
        return super().dispatch(request, *args, **kwargs)


def servicio_a_dict(servicio):
    return {
        "id": servicio.id,
        "sucursal_id": servicio.sucursal_id,
        "nombre": servicio.nombre,
        "duracion_minutos": servicio.duracion_minutos,
        "precio": str(servicio.precio),
        "icono": servicio.icono,
        "descripcion": servicio.descripcion,
        "activo": servicio.activo,
        "orden": servicio.orden,
    }


class ServicioListCreateView(EmpresaAutenticadaView):
    def get(self, request):
        servicios = Servicio.objects.filter(empresa_id=request.user.empresa_id, activo=True).order_by('orden', 'nombre')
        return JsonResponse({"servicios": [servicio_a_dict(s) for s in servicios]})

    def post(self, request):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido"}, status=400)

        nombre = (data.get("nombre") or "").strip()
        if not nombre:
            return JsonResponse({"error": "El nombre del servicio es obligatorio"}, status=400)

        try:
            precio = Decimal(str(data["precio"]))
            duracion = int(data["duracion_minutos"])
        except (KeyError, InvalidOperation, ValueError, TypeError):
            return JsonResponse({"error": "Precio y duración deben ser valores válidos"}, status=400)

        servicio = Servicio.objects.create(
            empresa=request.user.empresa,
            sucursal_id=data.get("sucursal_id") or None,
            nombre=nombre,
            duracion_minutos=duracion,
            precio=precio,
            icono=(data.get("icono") or "").strip() or "fa-hand-sparkles",
            descripcion=(data.get("descripcion") or "").strip() or None,
            activo=data.get("activo", True),
            orden=data.get("orden", 0),
        )
        return JsonResponse({"servicio": servicio_a_dict(servicio)}, status=201)


class ServicioDetailView(EmpresaAutenticadaView):
    def put(self, request, pk):
        servicio = get_object_or_404(Servicio, pk=pk, empresa_id=request.user.empresa_id)
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido"}, status=400)

        servicio.nombre = (data.get("nombre") or servicio.nombre).strip()
        try:
            servicio.precio = Decimal(str(data.get("precio", servicio.precio)))
            servicio.duracion_minutos = int(data.get("duracion_minutos", servicio.duracion_minutos))
        except (InvalidOperation, ValueError, TypeError):
            return JsonResponse({"error": "Precio o duración inválidos"}, status=400)

        servicio.icono = (data.get("icono") or servicio.icono).strip()
        servicio.descripcion = (data.get("descripcion") or servicio.descripcion).strip() or None
        servicio.activo = data.get("activo", servicio.activo)
        servicio.orden = data.get("orden", servicio.orden)
        servicio.full_clean()
        servicio.save()
        return JsonResponse({"servicio": servicio_a_dict(servicio)})

    def delete(self, request, pk):
        servicio = get_object_or_404(Servicio, pk=pk, empresa_id=request.user.empresa_id)
        servicio.activo = False
        servicio.save(update_fields=["activo"])
        return JsonResponse({"ok": True})
