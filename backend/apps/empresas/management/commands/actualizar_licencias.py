from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.empresas.models import LicenciaToken


class Command(BaseCommand):
    help = "Marca como VENCIDA toda licencia activa cuya fecha de vencimiento ya pasó."

    def handle(self, *args, **options):
        actualizadas = LicenciaToken.objects.filter(
            estado="ACTIVA",
            fecha_vencimiento__lt=timezone.now(),
        ).update(estado="VENCIDA")
        self.stdout.write(self.style.SUCCESS(f"Licencias vencidas actualizadas: {actualizadas}"))
