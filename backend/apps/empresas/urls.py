from django.urls import path

from .views import (
    ConfiguracionLandingView,
    LandingPublicaView,
    ReservarCitaView,
    SuperAdminEmpresaListCreateView,
    PlanLicenciaListView,
)

urlpatterns = [
    path('configuracion/landing/', ConfiguracionLandingView.as_view(), name='configuracion-landing'),
    path('superadmin/', SuperAdminEmpresaListCreateView.as_view(), name='superadmin-empresas'),
    path('superadmin/planes/', PlanLicenciaListView.as_view(), name='superadmin-planes'),
    path('<slug:slug>/landing/', LandingPublicaView.as_view(), name='landing-publica'),
    path('<slug:slug>/citas/', ReservarCitaView.as_view(), name='reservar-cita'),
]
