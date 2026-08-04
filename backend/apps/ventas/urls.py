from django.urls import path

from .views import ProductoListCreateView, VentaListView

urlpatterns = [
    path('', VentaListView.as_view(), name='lista-ventas'),
    path('productos/', ProductoListCreateView.as_view(), name='lista-productos'),
]
