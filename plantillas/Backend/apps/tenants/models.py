from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone


class Company(models.Model):
    """Cliente (tenant). Todos los datos operativos pertenecen a una empresa."""
    name = models.CharField(max_length=160)
    slug = models.SlugField(unique=True, max_length=80, validators=[RegexValidator(r"^[a-z0-9-]+$")])
    is_active = models.BooleanField(default=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30, blank=True)
    landing_config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self): return self.name


class Membership(models.Model):
    class Role(models.TextChoices): OWNER = "owner", "Propietario"; MANAGER = "manager", "Administrador"; STAFF = "staff", "Personal"
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="company_memberships")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=12, choices=Role.choices, default=Role.STAFF)
    is_active = models.BooleanField(default=True)
    class Meta: constraints = [models.UniqueConstraint(fields=["user", "company"], name="unique_company_membership")]


class License(models.Model):
    class Status(models.TextChoices): ACTIVE = "active", "Activa"; EXPIRED = "expired", "Vencida"; SUSPENDED = "suspended", "Suspendida"; CANCELLED = "cancelled", "Cancelada"
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name="licenses")
    plan_name = models.CharField(max_length=80)
    starts_at = models.DateField(default=timezone.localdate)
    expires_at = models.DateField()
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)
    max_users = models.PositiveIntegerField(default=3)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta: ordering = ["-expires_at"]

    @property
    def is_usable(self):
        return self.status == self.Status.ACTIVE and self.starts_at <= timezone.localdate() <= self.expires_at

    def save(self, *args, **kwargs):
        if self.status == self.Status.ACTIVE and self.expires_at < timezone.localdate(): self.status = self.Status.EXPIRED
        super().save(*args, **kwargs)
