from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.tenants.models import Company, License
from .models import Appointment, Service, StaffMember
from .permissions import IsCompanyManager
from .serializers import AppointmentSerializer, CompanySerializer, LicenseSerializer, PublicCompanySerializer, ServiceSerializer, StaffMemberSerializer


class CompanyScopedView:
    def get_company(self):
        if not hasattr(self, "_company"):
            self._company = get_object_or_404(Company, slug=self.kwargs["company_slug"], is_active=True)
        return self._company


class PublicCompanyView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, company_slug):
        company = get_object_or_404(Company, slug=company_slug, is_active=True)
        return Response(PublicCompanySerializer(company).data)


class PublicServicesView(CompanyScopedView, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ServiceSerializer
    def get_queryset(self): return Service.objects.filter(company=self.get_company(), is_active=True)


class PublicStaffView(CompanyScopedView, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = StaffMemberSerializer
    def get_queryset(self): return StaffMember.objects.filter(company=self.get_company(), is_active=True)


class PublicAppointmentsView(CompanyScopedView, generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = AppointmentSerializer
    def get_serializer_context(self):
        context = super().get_serializer_context(); context["company"] = self.get_company(); return context


class ManagerServicesView(CompanyScopedView, generics.ListCreateAPIView):
    permission_classes = [IsCompanyManager]
    serializer_class = ServiceSerializer
    def get_queryset(self): return Service.objects.filter(company=self.get_company())
    def perform_create(self, serializer): serializer.save(company=self.get_company())


class ManagerServiceDetailView(CompanyScopedView, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCompanyManager]
    serializer_class = ServiceSerializer
    def get_queryset(self): return Service.objects.filter(company=self.get_company())


class ManagerStaffView(CompanyScopedView, generics.ListCreateAPIView):
    permission_classes = [IsCompanyManager]
    serializer_class = StaffMemberSerializer
    def get_queryset(self): return StaffMember.objects.filter(company=self.get_company())
    def perform_create(self, serializer): serializer.save(company=self.get_company())


class ManagerAppointmentsView(CompanyScopedView, generics.ListAPIView):
    permission_classes = [IsCompanyManager]
    serializer_class = AppointmentSerializer
    def get_queryset(self): return Appointment.objects.filter(company=self.get_company()).select_related("service", "staff_member")


class ManagerAppointmentDetailView(CompanyScopedView, generics.RetrieveUpdateAPIView):
    permission_classes = [IsCompanyManager]
    serializer_class = AppointmentSerializer
    def get_queryset(self): return Appointment.objects.filter(company=self.get_company())
    def get_serializer_context(self):
        context = super().get_serializer_context(); context["company"] = self.get_company(); return context


class ProviderCompaniesView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CompanySerializer
    queryset = Company.objects.all()


class ProviderLicensesView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = LicenseSerializer
    queryset = License.objects.select_related("company")


class LicenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Operación exclusiva del equipo proveedor: renovar, suspender o cancelar licencias."""
    permission_classes = [IsAdminUser]
    queryset = License.objects.select_related("company")
    serializer_class = LicenseSerializer

    def get(self, request, *args, **kwargs):
        license = self.get_object()
        return Response(LicenseSerializer(license).data)

    def patch(self, request, *args, **kwargs):
        license = self.get_object()
        serializer = self.get_serializer(license, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True); serializer.save()
        return Response(serializer.data)
