# Backend de licencias y agenda

Backend Django para una plataforma SaaS de salones. PostgreSQL es obligatorio: no hay archivos JSON ni datos compartidos entre empresas.

## Instalación

1. Instalar Python 3.12+ y PostgreSQL.
2. Crear `Backend/.env` a partir de `.env.example` y crear la base indicada.
3. Desde `Backend`, ejecutar `py -m venv .venv`, activar el entorno e instalar `pip install -r requirements.txt`.
4. Ejecutar `py manage.py migrate`, `py manage.py createsuperuser` y `py manage.py runserver`.

## Rutas

Las rutas públicas usan el identificador estable de la empresa, por ejemplo `glow-spa`:

- `GET /api/v1/public/glow-spa/` — configuración de landing.
- `GET /api/v1/public/glow-spa/services/` y `/staff/` — catálogo público.
- `POST /api/v1/public/glow-spa/appointments/` — reserva. Solo se acepta con licencia activa.
- `GET|POST /api/v1/companies/glow-spa/services/` — panel de la empresa.
- `GET /api/v1/companies/glow-spa/appointments/` — panel de la empresa.
- `GET|POST /api/v1/provider/companies/` — alta y administración de clientes, exclusiva del proveedor.
- `GET|POST /api/v1/provider/licenses/` y `GET|PATCH|DELETE /api/v1/provider/licenses/{id}/` — alta, renovación, suspensión, cancelación o eliminación de licencias, exclusivos del proveedor.

Los usuarios del panel requieren una `Membership` activa de la empresa, con rol `owner` o `manager`; por ello una URL manipulada no permite ver ni modificar datos de otra empresa. El proveedor gestiona empresas, licencias y usuarios desde `/admin/` inicialmente.
