const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const USERS_ROUTE = import.meta.env.VITE_API_USUARIOS_ROUTE || '/usuarios'
const COMPANIES_ROUTE = import.meta.env.VITE_API_EMPRESAS_ROUTE || '/empresas'
const SALES_ROUTE = import.meta.env.VITE_API_VENTAS_ROUTE || '/ventas'
const SERVICES_ROUTE = import.meta.env.VITE_API_SERVICIOS_ROUTE || '/servicios'

function csrfToken() {
  return document.cookie.split('; ').find((row) => row.startsWith('csrftoken='))?.split('=')[1]
}

export async function api(path, options = {}) {
  const { method = 'GET', body, csrf } = options
  const requireCsrf = csrf !== undefined ? csrf : !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())

  if (requireCsrf && !csrfToken()) {
    await fetch(`${API_BASE_URL}${USERS_ROUTE}/csrf/`, { credentials: 'include' })
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(requireCsrf && csrfToken() ? { 'X-CSRFToken': csrfToken() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || `Error ${response.status}`)
  return payload
}

export const landingPublico = (slug) => api(`${COMPANIES_ROUTE}/${encodeURIComponent(slug)}/landing/`)
export const reservarCita = (slug, cita) => api(`${COMPANIES_ROUTE}/${encodeURIComponent(slug)}/citas/`, { method: 'POST', body: cita })
export const iniciarSesion = (credenciales) => api(`${USERS_ROUTE}/login/`, { method: 'POST', body: credenciales, csrf: true })
export const cerrarSesion = () => api(`${USERS_ROUTE}/logout/`, { method: 'POST', csrf: true })
export const sesionActual = () => api(`${USERS_ROUTE}/me/`)
export const configuracionLanding = () => api(`${COMPANIES_ROUTE}/configuracion/landing/`)
export const guardarConfiguracionLanding = (configuracion) => api(`${COMPANIES_ROUTE}/configuracion/landing/`, { method: 'PATCH', body: configuracion, csrf: true })

// ── Servicios (panel del dueño) ─────────────────────────────────────────────
export const listarServicios = () => api(`${SERVICES_ROUTE}/`)
export const crearServicio = (servicio) => api(`${SERVICES_ROUTE}/`, { method: 'POST', body: servicio, csrf: true })
export const actualizarServicio = (id, servicio) => api(`${SERVICES_ROUTE}/${id}/`, { method: 'PUT', body: servicio, csrf: true })
export const eliminarServicio = (id) => api(`${SERVICES_ROUTE}/${id}/`, { method: 'DELETE', csrf: true })

// ── SuperAdmin (gestión de empresas y licencias) ─────────────────────────────
export const listarEmpresasSuperAdmin = () => api(`${COMPANIES_ROUTE}/superadmin/`)
export const crearEmpresaSuperAdmin = (empresa) => api(`${COMPANIES_ROUTE}/superadmin/`, { method: 'POST', body: empresa, csrf: true })
export const listarPlanesLicencia = () => api(`${COMPANIES_ROUTE}/superadmin/planes/`)
export const accionLicencia = (id, accion, data = {}) => api(`${COMPANIES_ROUTE}/superadmin/licencias/${id}/${accion}/`, { method: 'POST', body: data, csrf: true })
export const restablecerClavePropietario = (empresaId, password) => api(`${COMPANIES_ROUTE}/superadmin/empresas/${empresaId}/cuenta/`, { method: 'POST', body: { password }, csrf: true })
export const detalleEmpresaSuperAdmin = (empresaId) => api(`${COMPANIES_ROUTE}/superadmin/empresas/${empresaId}/`)
export const actualizarEmpresaSuperAdmin = (empresaId, empresa) => api(`${COMPANIES_ROUTE}/superadmin/empresas/${empresaId}/`, { method: 'PATCH', body: empresa, csrf: true })

// ── Ventas y productos (panel del dueño) ─────────────────────────────────────
export const listarVentas = () => api(`${SALES_ROUTE}/`)
export const listarProductos = () => api(`${SALES_ROUTE}/productos/`)
export const crearProducto = (producto) => api(`${SALES_ROUTE}/productos/`, { method: 'POST', body: producto, csrf: true })
