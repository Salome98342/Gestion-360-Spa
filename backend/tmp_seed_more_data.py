import os
import django
from decimal import Decimal
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.empresas.models import Empresa, Sucursal, Cliente
from apps.servicios.models import Servicio
from apps.ventas.models import Producto, Venta, DetalleVenta, MetodoPago
from apps.usuarios.models import Usuario

now = timezone.now()

companies = [
    {
        'slug': 'glow-spa',
        'services': [
            {'nombre': 'Masaje relajante', 'duracion_minutos': 60, 'precio': '120000', 'icono': 'fa-hand-holding-heart', 'descripcion': 'Masaje completo para aliviar tensión y estrés.', 'orden': 0},
            {'nombre': 'Facial rejuvenecedor', 'duracion_minutos': 45, 'precio': '90000', 'icono': 'fa-face-smile', 'descripcion': 'Limpieza profunda y tratamiento protector para tu piel.', 'orden': 1},
            {'nombre': 'Manicure de gel', 'duracion_minutos': 50, 'precio': '80000', 'icono': 'fa-hand-sparkles', 'descripcion': 'Manicure profesional con acabado en gel durable.', 'orden': 2},
        ],
        'products': [
            {'nombre': 'Aceite esencial relajante', 'precio_venta': '35000', 'costo': '12000', 'stock_actual': 20, 'descripcion': 'Aroma floral para potenciar la relajación.', 'codigo_barras': 'GLW001'},
            {'nombre': 'Crema facial nutritiva', 'precio_venta': '45000', 'costo': '18000', 'stock_actual': 15, 'descripcion': 'Hidratación profunda y brillo natural.', 'codigo_barras': 'GLW002'},
        ],
        'venta': {
            'cliente': {'nombre': 'Andrea Pérez', 'telefono': '+57 300 999 0001', 'email': 'andrea.perez@example.com'},
            'vendedor_username': 'dueno_glow',
            'detalle': {'descripcion': 'Masaje relajante', 'cantidad': 1, 'precio_unitario': '120000'},
            'producto_detalle': {'descripcion': 'Aceite esencial relajante', 'cantidad': 1, 'precio_unitario': '35000'},
            'metodo_pago': 'Efectivo',
        },
    },
    {
        'slug': 'unas-express',
        'services': [
            {'nombre': 'Manicure express', 'duracion_minutos': 30, 'precio': '45000', 'icono': 'fa-hand', 'descripcion': 'Manicure rápido y profesional.', 'orden': 0},
            {'nombre': 'Pedicure spa', 'duracion_minutos': 60, 'precio': '95000', 'icono': 'fa-foot', 'descripcion': 'Pedicure completo con baño y masaje.', 'orden': 1},
            {'nombre': 'Decorado premium', 'duracion_minutos': 40, 'precio': '65000', 'icono': 'fa-gem', 'descripcion': 'Diseños personalizados y acabado de lujo.', 'orden': 2},
        ],
        'products': [
            {'nombre': 'Esmalte semipermanente', 'precio_venta': '25000', 'costo': '9000', 'stock_actual': 30, 'descripcion': 'Esmalte de larga duración para uñas.', 'codigo_barras': 'UNE001'},
            {'nombre': 'Set de cuidado de uñas', 'precio_venta': '55000', 'costo': '20000', 'stock_actual': 18, 'descripcion': 'Kit con lima, aceite y crema para uñas.', 'codigo_barras': 'UNE002'},
        ],
        'venta': {
            'cliente': {'nombre': 'Camila Torres', 'telefono': '+57 310 888 0002', 'email': 'camila.torres@example.com'},
            'vendedor_username': 'dueno_unas',
            'detalle': {'descripcion': 'Pedicure spa', 'cantidad': 1, 'precio_unitario': '95000'},
            'producto_detalle': {'descripcion': 'Set de cuidado de uñas', 'cantidad': 1, 'precio_unitario': '55000'},
            'metodo_pago': 'Tarjeta',
        },
    },
]

for data in companies:
    empresa = Empresa.objects.filter(slug=data['slug']).first()
    if not empresa:
        print('Skipping missing empresa', data['slug'])
        continue

    sucursal = Sucursal.objects.filter(empresa=empresa).first()
    if not sucursal:
        print('Skipping missing sucursal for', empresa.slug)
        continue

    for servicio_data in data['services']:
        servicio, created = Servicio.objects.get_or_create(
            empresa=empresa,
            nombre=servicio_data['nombre'],
            defaults={
                'sucursal': sucursal,
                'duracion_minutos': servicio_data['duracion_minutos'],
                'precio': Decimal(servicio_data['precio']),
                'icono': servicio_data['icono'],
                'descripcion': servicio_data['descripcion'],
                'activo': True,
                'orden': servicio_data['orden'],
            }
        )
        print('Service', 'created' if created else 'exists', servicio.nombre, 'for', empresa.slug)

    for product_data in data['products']:
        producto, created = Producto.objects.get_or_create(
            empresa=empresa,
            nombre=product_data['nombre'],
            defaults={
                'sucursal': sucursal,
                'codigo_barras': product_data['codigo_barras'],
                'descripcion': product_data['descripcion'],
                'precio_venta': Decimal(product_data['precio_venta']),
                'costo': Decimal(product_data['costo']),
                'stock_actual': product_data['stock_actual'],
                'activo': True,
            }
        )
        print('Product', 'created' if created else 'exists', producto.nombre, 'for', empresa.slug)

    metodo_pago, _ = MetodoPago.objects.get_or_create(empresa=empresa, nombre=data['venta']['metodo_pago'], defaults={'requiere_ref': False, 'activo': True})

    cliente_data = data['venta']['cliente']
    cliente, _ = Cliente.objects.get_or_create(
        empresa=empresa,
        telefono=cliente_data['telefono'],
        defaults={'nombre': cliente_data['nombre'], 'email': cliente_data['email']},
    )

    usuario = Usuario.objects.filter(username=data['venta']['vendedor_username']).first()
    if not usuario:
        print('Missing user', data['venta']['vendedor_username'], 'for', empresa.slug)
        continue

    subtotal = Decimal(data['venta']['detalle']['precio_unitario']) * data['venta']['detalle']['cantidad']
    producto_subtotal = Decimal(data['venta']['producto_detalle']['precio_unitario']) * data['venta']['producto_detalle']['cantidad']
    total = subtotal + producto_subtotal

    venta = Venta.objects.create(
        empresa=empresa,
        sucursal=sucursal,
        cliente=cliente,
        vendedor=usuario,
        subtotal=subtotal + producto_subtotal,
        impuestos=Decimal('0.00'),
        descuento=Decimal('0.00'),
        total=total,
        estado='COMPLETADA',
    )
    DetalleVenta.objects.create(
        venta=venta,
        descripcion=data['venta']['detalle']['descripcion'],
        cantidad=data['venta']['detalle']['cantidad'],
        precio_unitario=Decimal(data['venta']['detalle']['precio_unitario']),
        subtotal=subtotal,
    )
    DetalleVenta.objects.create(
        venta=venta,
        descripcion=data['venta']['producto_detalle']['descripcion'],
        cantidad=data['venta']['producto_detalle']['cantidad'],
        precio_unitario=Decimal(data['venta']['producto_detalle']['precio_unitario']),
        subtotal=producto_subtotal,
    )
    print('Created sale for', empresa.slug, 'total', total)

print('More data seeded.')
