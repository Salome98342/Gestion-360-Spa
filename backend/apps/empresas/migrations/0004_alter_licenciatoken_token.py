# Generated manually to persist the automatic, non-predictable license token.

import apps.empresas.models
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("empresas", "0003_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="licenciatoken",
            name="token",
            field=models.CharField(
                default=apps.empresas.models.generar_token_licencia,
                editable=False,
                max_length=128,
                unique=True,
            ),
        ),
    ]
