from django.urls import path

from .views import ServicioDetailView, ServicioListCreateView

urlpatterns = [
    path('', ServicioListCreateView.as_view(), name='servicio-list'),
    path('<int:pk>/', ServicioDetailView.as_view(), name='servicio-detail'),
]
