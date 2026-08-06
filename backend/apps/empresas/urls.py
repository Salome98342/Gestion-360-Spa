from django.urls import path

from .views import (
    ConfiguracionLandingView,
    CitasEmpresaView,
    DisponibilidadCitasView,
    ImagenEmpresaUploadView,
    LandingPublicaView,
    LicenciaAccionView,
    CuentaPropietarioView,
    EmpresaDetalleSuperAdminView,
    PlanLicenciaListView,
    ReservarCitaView,
    SuperAdminEmpresaListCreateView,
)

urlpatterns = [
    path('configuracion/landing/', ConfiguracionLandingView.as_view(), name='configuracion-landing'),
    path('configuracion/citas/', CitasEmpresaView.as_view(), name='citas-empresa'),
    path('configuracion/imagenes/', ImagenEmpresaUploadView.as_view(), name='imagenes-empresa'),
    path('superadmin/', SuperAdminEmpresaListCreateView.as_view(), name='superadmin-empresas'),
    path('superadmin/planes/', PlanLicenciaListView.as_view(), name='superadmin-planes'),
    path('superadmin/licencias/<int:pk>/<str:accion>/', LicenciaAccionView.as_view(), name='licencia-accion'),
    path('superadmin/empresas/<int:pk>/cuenta/', CuentaPropietarioView.as_view(), name='cuenta-propietario'),
    path('superadmin/empresas/<int:pk>/', EmpresaDetalleSuperAdminView.as_view(), name='superadmin-empresa-detalle'),
    path('<slug:slug>/disponibilidad/', DisponibilidadCitasView.as_view(), name='disponibilidad-citas'),
    path('<slug:slug>/landing/', LandingPublicaView.as_view(), name='landing-publica'),
    path('<slug:slug>/citas/', ReservarCitaView.as_view(), name='reservar-cita'),
]
