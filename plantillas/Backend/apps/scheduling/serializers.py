from django.db import IntegrityError, transaction
from rest_framework import serializers
from apps.tenants.models import Company, License
from .models import Appointment, Service, StaffMember


class PublicCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["name", "slug", "contact_phone", "landing_config"]


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "slug", "is_active", "contact_email", "contact_phone", "landing_config", "created_at"]
        read_only_fields = ["id", "created_at"]


class LicenseSerializer(serializers.ModelSerializer):
    is_usable = serializers.BooleanField(read_only=True)
    class Meta:
        model = License
        fields = ["id", "company", "plan_name", "starts_at", "expires_at", "status", "max_users", "notes", "is_usable"]
        read_only_fields = ["id", "is_usable"]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "duration_minutes", "price", "description", "is_active"]
        read_only_fields = ["id"]


class StaffMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffMember
        fields = ["id", "name", "email", "is_active"]
        read_only_fields = ["id"]


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "service", "staff_member", "client_name", "client_phone", "client_email", "starts_at", "notes", "status", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        company = self.context["company"]
        service = attrs.get("service", getattr(self.instance, "service", None))
        staff = attrs.get("staff_member", getattr(self.instance, "staff_member", None))
        if service and service.company_id != company.id:
            raise serializers.ValidationError({"service": "Servicio inválido para esta empresa."})
        if staff and staff.company_id != company.id:
            raise serializers.ValidationError({"staff_member": "Profesional inválido para esta empresa."})
        if service and not service.is_active: raise serializers.ValidationError({"service": "Este servicio no está disponible."})
        if staff and not staff.is_active: raise serializers.ValidationError({"staff_member": "Este profesional no está disponible."})
        return attrs

    def create(self, validated_data):
        company = self.context["company"]
        if not License.objects.filter(company=company, status=License.Status.ACTIVE, starts_at__lte=validated_data["starts_at"].date(), expires_at__gte=validated_data["starts_at"].date()).exists():
            raise serializers.ValidationError("La agenda no está disponible para esta empresa.")
        try:
            with transaction.atomic(): return Appointment.objects.create(company=company, **validated_data)
        except IntegrityError as exc:
            raise serializers.ValidationError({"starts_at": "Ese horario acaba de ser reservado."}) from exc
