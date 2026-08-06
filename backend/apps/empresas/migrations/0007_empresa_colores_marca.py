from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('empresas', '0006_configuracionlanding_galeria_urls')]

    operations = [
        migrations.AddField(model_name='empresa', name='color_fondo', field=models.TextField(default='#f8fafc')),
        migrations.AddField(model_name='empresa', name='color_superficie', field=models.TextField(default='#ffffff')),
        migrations.AddField(model_name='empresa', name='color_texto', field=models.TextField(default='#111827')),
        migrations.AddField(model_name='empresa', name='color_texto_boton', field=models.TextField(default='#ffffff')),
    ]
