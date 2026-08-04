from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("empresas", "0005_cita_unica_sucursal_horario")]

    operations = [
        migrations.AddField(
            model_name="configuracionlanding",
            name="galeria_urls",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
