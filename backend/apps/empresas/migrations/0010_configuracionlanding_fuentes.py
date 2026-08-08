from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('empresas', '0009_planes_licencias_finales')]

    operations = [
        migrations.AddField(model_name='configuracionlanding', name='fuente_titulos', field=models.TextField(default='Playfair Display')),
        migrations.AddField(model_name='configuracionlanding', name='fuente_cuerpo', field=models.TextField(default='Poppins')),
        migrations.AddField(model_name='configuracionlanding', name='fuente_script', field=models.TextField(default='Great Vibes')),
    ]
