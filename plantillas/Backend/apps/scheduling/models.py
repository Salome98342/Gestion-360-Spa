from django.core.exceptions import ValidationError
from django.db import models
from apps.tenants.models import Company


class Service(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="services")
    name = models.CharField(max_length=120)
    duration_minutes = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    class Meta: constraints = [models.UniqueConstraint(fields=["company", "name"], name="unique_company_service_name")]


class StaffMember(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="staff")
    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)


class Appointment(models.Model):
    class Status(models.TextChoices): PENDING = "pending", "Pendiente"; CONFIRMED = "confirmed", "Confirmada"; CANCELLED = "cancelled", "Cancelada"; COMPLETED = "completed", "Completada"
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="appointments")
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="appointments")
    staff_member = models.ForeignKey(StaffMember, on_delete=models.PROTECT, related_name="appointments")
    client_name = models.CharField(max_length=140)
    client_phone = models.CharField(max_length=30)
    client_email = models.EmailField(blank=True)
    starts_at = models.DateTimeField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["starts_at"]
        constraints = [models.UniqueConstraint(fields=["company", "staff_member", "starts_at"], name="unique_staff_booking_start")]

    def clean(self):
        errors = {}
        if self.service_id and self.company_id and self.service.company_id != self.company_id: errors["service"] = "El servicio no pertenece a la empresa."
        if self.staff_member_id and self.company_id and self.staff_member.company_id != self.company_id: errors["staff_member"] = "El profesional no pertenece a la empresa."
        if errors: raise ValidationError(errors)
