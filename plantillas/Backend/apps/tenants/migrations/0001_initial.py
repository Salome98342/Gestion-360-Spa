from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(name="Company", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("name", models.CharField(max_length=160)), ("slug", models.SlugField(max_length=80, unique=True)),
            ("is_active", models.BooleanField(default=True)), ("contact_email", models.EmailField(max_length=254)),
            ("contact_phone", models.CharField(blank=True, max_length=30)), ("landing_config", models.JSONField(blank=True, default=dict)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
        ], options={"ordering": ["name"]}),
        migrations.CreateModel(name="License", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("plan_name", models.CharField(max_length=80)), ("starts_at", models.DateField(default=django.utils.timezone.localdate)),
            ("expires_at", models.DateField()), ("status", models.CharField(choices=[("active", "Activa"), ("expired", "Vencida"), ("suspended", "Suspendida"), ("cancelled", "Cancelada")], default="active", max_length=12)),
            ("max_users", models.PositiveIntegerField(default=3)), ("notes", models.TextField(blank=True)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("company", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="licenses", to="tenants.company")),
        ], options={"ordering": ["-expires_at"]}),
        migrations.CreateModel(name="Membership", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("role", models.CharField(choices=[("owner", "Propietario"), ("manager", "Administrador"), ("staff", "Personal")], default="staff", max_length=12)),
            ("is_active", models.BooleanField(default=True)),
            ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="memberships", to="tenants.company")),
            ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="company_memberships", to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.AddConstraint(model_name="membership", constraint=models.UniqueConstraint(fields=("user", "company"), name="unique_company_membership")),
    ]
