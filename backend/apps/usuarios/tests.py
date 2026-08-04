import json

from django.test import TestCase, Client
from django.urls import reverse

from apps.empresas.models import Empresa
from .models import Usuario


class UsuarioModelTests(TestCase):
    def setUp(self):
        self.empresa = Empresa.objects.create(nombre="Glow Spa", slug="glow-spa")

    def test_usuario_sin_empresa_es_staff_interno(self):
        usuario = Usuario.objects.create_user(username="soporte1", password="clave123", rol=Usuario.Rol.SOPORTE)
        self.assertTrue(usuario.es_staff_interno)
        self.assertTrue(usuario.puede_administrar_empresa)

    def test_usuario_de_empresa_sin_licencia_no_puede_administrar(self):
        usuario = Usuario.objects.create_user(
            username="dueno1", password="clave123",
            rol=Usuario.Rol.DUENO, empresa=self.empresa,
        )
        # La empresa no tiene ninguna LicenciaToken activa todavía.
        self.assertFalse(usuario.puede_administrar_empresa)

    def test_pertenece_a(self):
        usuario = Usuario.objects.create_user(
            username="empleado1", password="clave123",
            rol=Usuario.Rol.EMPLEADO, empresa=self.empresa,
        )
        self.assertTrue(usuario.pertenece_a(self.empresa))


class LoginViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.usuario = Usuario.objects.create_user(
            username="soporte1", password="clave123", rol=Usuario.Rol.SOPORTE,
        )

    def test_login_correcto(self):
        resp = self.client.post(
            "/api/usuarios/login/",
            data=json.dumps({"username": "soporte1", "password": "clave123"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["usuario"]["username"], "soporte1")

    def test_login_credenciales_invalidas(self):
        resp = self.client.post(
            "/api/usuarios/login/",
            data=json.dumps({"username": "soporte1", "password": "mala-clave"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)