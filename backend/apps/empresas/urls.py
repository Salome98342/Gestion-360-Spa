from django.urls import path

from .views import ConfiguracionLandingView, LandingPublicaView, ReservarCitaView

urlpatterns = [
    path('configuracion/landing/', ConfiguracionLandingView.as_view(), name='configuracion-landing'),
    path('<slug:slug>/landing/', LandingPublicaView.as_view(), name='landing-publica'),
    path('<slug:slug>/citas/', ReservarCitaView.as_view(), name='reservar-cita'),
]
