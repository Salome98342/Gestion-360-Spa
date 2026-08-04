const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const USERS_ROUTE = import.meta.env.VITE_API_USUARIOS_ROUTE || '/usuarios'
const COMPANIES_ROUTE = import.meta.env.VITE_API_EMPRESAS_ROUTE || '/empresas'
const SALES_ROUTE = import.meta.env.VITE_API_VENTAS_ROUTE || '/ventas'

function csrfToken() {
  return document.cookie.split('; ').find((row) => row.startsWith('csrftoken='))?.split('=')[1]
}

export async function api(path, options = {}) {
  const { method = 'GET', body, csrf = false } = options
  if (csrf && !csrfToken()) {
    await fetch(`${API_BASE_URL}${USERS_ROUTE}/csrf/`, { credentials: 'include' })
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(csrfToken() && method !== 'GET' ? { 'X-CSRFToken': csrfToken() } : {}),
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
