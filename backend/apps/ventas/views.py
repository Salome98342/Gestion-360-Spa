"""Endpoints de ventas aislados por empresa.

No se acepta ``empresa`` desde el cliente: siempre se toma del usuario de la
sesión. Así se evita que modificar un id en el navegador exponga otro tenant.
"""

import json
from decimal import Decimal, InvalidOperation

from django.http import JsonResponse
from django.views import View

from .models import Producto, Venta


class EmpresaAutenticadaView(View):
    """Requiere sesión, empresa asignada y licencia actualmente vigente."""

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "No autenticado"}, status=401)
        if not request.user.empresa_id:
            return JsonResponse({"error": "Este endpoint requiere una empresa asignada"}, status=403)
        if not request.user.puede_administrar_empresa:
            return JsonResponse({"error": "La empresa no tiene una licencia activa"}, status=403)
        return super().dispatch(request, *args, **kwargs)


def producto_a_dict(producto):
    return {
        "id": producto.id,
        "sucursal_id": producto.sucursal_id,
        "nombre": producto.nombre,
        "codigo_barras": producto.codigo_barras,
        "descripcion": producto.descripcion,
        "precio_venta": str(producto.precio_venta),
        "costo": str(producto.costo),
        "stock_actual": producto.stock_actual,
        "activo": producto.activo,
    }


class ProductoListCreateView(EmpresaAutenticadaView):
    """GET/POST /api/ventas/productos/."""

    def get(self, request):
        productos = Producto.objects.filter(
            empresa_id=request.user.empresa_id,
            activo=True,
        ).order_by("nombre")
        return JsonResponse({"productos": [producto_a_dict(p) for p in productos]})

    def post(self, request):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido"}, status=400)

        nombre = (data.get("nombre") or "").strip()
        if not nombre:
            return JsonResponse({"error": "El nombre es obligatorio"}, status=400)
        try:
            precio_venta = Decimal(str(data["precio_venta"]))
        except (KeyError, InvalidOperation, ValueError):
            return JsonResponse({"error": "precio_venta debe ser un número válido"}, status=400)

        sucursal_id = data.get("sucursal_id")
        if sucursal_id and not request.user.empresa.sucursales.filter(id=sucursal_id, activa=True).exists():
            return JsonResponse({"error": "La sucursal no pertenece a la empresa"}, status=400)

        try:
            costo = Decimal(str(data.get("costo", "0")))
            stock = int(data.get("stock_actual", 0))
        except (InvalidOperation, ValueError, TypeError):
            return JsonResponse({"error": "Costo o stock inválido"}, status=400)

        producto = Producto.objects.create(
            empresa=request.user.empresa,
            sucursal_id=sucursal_id or None,
            nombre=nombre,
            codigo_barras=(data.get("codigo_barras") or "").strip() or None,
            descripcion=(data.get("descripcion") or "").strip() or None,
            precio_venta=precio_venta,
            costo=costo,
            stock_actual=stock,
        )
        return JsonResponse({"producto": producto_a_dict(producto)}, status=201)


class VentaListView(EmpresaAutenticadaView):
    """GET /api/ventas/ — listado de ventas exclusivo del tenant actual."""

    def get(self, request):
        ventas = Venta.objects.filter(empresa_id=request.user.empresa_id).order_by("-fecha_emision")
        return JsonResponse({
            "ventas": [
                {
                    "id": venta.id,
                    "sucursal_id": venta.sucursal_id,
                    "cliente_id": venta.cliente_id,
                    "total": str(venta.total),
                    "estado": venta.estado,
                    "fecha_emision": venta.fecha_emision.isoformat(),
                }
                for venta in ventas
            ]
        })
