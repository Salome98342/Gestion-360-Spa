from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("empresas", "0004_alter_licenciatoken_token")]

    operations = [
        migrations.AlterUniqueTogether(name="cita", unique_together=set()),
        migrations.AddConstraint(
            model_name="cita",
            constraint=models.UniqueConstraint(
                fields=("empresa", "sucursal", "fecha", "hora"),
                name="cita_unica_sucursal_horario",
            ),
        ),
    ]
