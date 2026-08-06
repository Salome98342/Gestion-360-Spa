from django.urls import path

from .views import (
    ConfiguracionLandingView,
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
    path('configuracion/imagenes/', ImagenEmpresaUploadView.as_view(), name='imagenes-empresa'),
    path('superadmin/', SuperAdminEmpresaListCreateView.as_view(), name='superadmin-empresas'),
    path('superadmin/planes/', PlanLicenciaListView.as_view(), name='superadmin-planes'),
    path('superadmin/licencias/<int:pk>/<str:accion>/', LicenciaAccionView.as_view(), name='licencia-accion'),
    path('superadmin/empresas/<int:pk>/cuenta/', CuentaPropietarioView.as_view(), name='cuenta-propietario'),
    path('superadmin/empresas/<int:pk>/', EmpresaDetalleSuperAdminView.as_view(), name='superadmin-empresa-detalle'),
    path('<slug:slug>/landing/', LandingPublicaView.as_view(), name='landing-publica'),
    path('<slug:slug>/citas/', ReservarCitaView.as_view(), name='reservar-cita'),
]
