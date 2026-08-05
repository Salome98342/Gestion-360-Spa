from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [("tenants", "0001_initial")]
    operations = [
        migrations.CreateModel(name="Service", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("name", models.CharField(max_length=120)), ("duration_minutes", models.PositiveIntegerField()),
            ("price", models.DecimalField(decimal_places=2, max_digits=12)), ("description", models.TextField(blank=True)),
            ("is_active", models.BooleanField(default=True)),
            ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="services", to="tenants.company")),
        ]),
        migrations.CreateModel(name="StaffMember", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("name", models.CharField(max_length=120)), ("email", models.EmailField(blank=True, max_length=254)),
            ("is_active", models.BooleanField(default=True)),
            ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="staff", to="tenants.company")),
        ]),
        migrations.CreateModel(name="Appointment", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("client_name", models.CharField(max_length=140)), ("client_phone", models.CharField(max_length=30)),
            ("client_email", models.EmailField(blank=True, max_length=254)), ("starts_at", models.DateTimeField()),
            ("notes", models.TextField(blank=True)), ("status", models.CharField(choices=[("pending", "Pendiente"), ("confirmed", "Confirmada"), ("cancelled", "Cancelada"), ("completed", "Completada")], default="pending", max_length=12)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="appointments", to="tenants.company")),
            ("service", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="appointments", to="scheduling.service")),
            ("staff_member", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="appointments", to="scheduling.staffmember")),
        ], options={"ordering": ["starts_at"]}),
        migrations.AddConstraint(model_name="service", constraint=models.UniqueConstraint(fields=("company", "name"), name="unique_company_service_name")),
        migrations.AddConstraint(model_name="appointment", constraint=models.UniqueConstraint(fields=("company", "staff_member", "starts_at"), name="unique_staff_booking_start")),
    ]
