import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { cerrarSesion, iniciarSesion, sesionActual } from '../../services/api'
import './SuperAdminLayout.css'

function navLinkClass({ isActive }) {
  return `superadmin-link ${isActive ? 'active' : ''}`
}

export default function SuperAdminLayout() {
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [login, setLogin] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    async function checkSession() {
      setChecking(true)
      try {
        const session = await sesionActual()
        if (!active) return
        if (!session.usuario.es_staff_interno) {
          await cerrarSesion()
          if (!active) return
          setUser(null)
          setAuthorized(false)
          setError('La sesión anterior no tenía permisos de SuperAdmin. Ingresa con tu cuenta de plataforma.')
          return
        }
        setUser(session.usuario)
        setAuthorized(true)
      } catch {
        if (!active) return
        setUser(null)
        setAuthorized(false)
      } finally {
        if (active) setChecking(false)
      }
    }
    checkSession()
    return () => { active = false }
  }, [])

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const session = await iniciarSesion(login)
      setUser(session.usuario)
      if (!session.usuario.es_staff_interno) {
        await cerrarSesion()
        setUser(null)
        setAuthorized(false)
        setError('Este usuario no tiene acceso al panel de administración SaaS.')
      } else {
        setAuthorized(true)
        setError('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="superadmin-auth-screen">
        <div className="superadmin-auth-card">
          <div className="superadmin-auth-brand">
            <div className="superadmin-brand-avatar"><i className="fas fa-spa"></i></div>
            <p className="superadmin-brand-title">Glow SaaS</p>
            <h1 className="superadmin-brand-heading">Administrador</h1>
          </div>
          <p className="superadmin-auth-copy">Verificando tu sesión…</p>
        </div>
      </div>
    )
  }

  if (!user || !authorized) {
    return (
      <div className="superadmin-auth-screen">
        <form className="superadmin-auth-card" onSubmit={handleLogin}>
          <div className="superadmin-auth-brand">
            <div className="superadmin-brand-avatar"><i className="fas fa-spa"></i></div>
            <p className="superadmin-brand-title">Glow SaaS</p>
            <h1 className="superadmin-brand-heading">Administrador</h1>
          </div>
          <p className="superadmin-auth-copy">
            {user && !authorized
              ? 'Tu cuenta no tiene permisos de administración SaaS. Ingresa con una cuenta de soporte.'
              : 'Ingresa con una cuenta de administrador para gestionar locales y licencias.'}
          </p>

          {error && <div className="notice error superadmin-auth-error">{error}</div>}

          <label className="superadmin-auth-field">
            <span>Usuario</span>
            <input
              value={login.username}
              onChange={(e) => setLogin({ ...login, username: e.target.value })}
              autoComplete="username"
              required
            />
          </label>
          <label className="superadmin-auth-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="superadmin-auth-button" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar al panel'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="superadmin-layout">
      <div className="superadmin-shell">
        <aside className="superadmin-aside">
          <div className="superadmin-brand">
            <div className="superadmin-brand-inner">
              <div className="superadmin-brand-avatar">
                <i className="fas fa-spa"></i>
              </div>
              <div>
                <p className="superadmin-brand-title">Glow SaaS</p>
                <h1 className="superadmin-brand-heading">Administrador</h1>
              </div>
            </div>
          </div>

          <nav className="superadmin-nav">
            <NavLink to="/superadmin" end className={navLinkClass}>
              <span className="superadmin-link-icon">
                <i className="fas fa-chart-line"></i>
              </span>
              Resumen SaaS
            </NavLink>
            <NavLink to="/superadmin/empresas" className={navLinkClass}>
              <span className="superadmin-link-icon">
                <i className="fas fa-store"></i>
              </span>
              Locales y licencias
            </NavLink>
          </nav>

          <div className="superadmin-footer">
            <p className="superadmin-footer-label">Sesión</p>
            <p className="superadmin-footer-copy">{user.username}</p>
            <button
              type="button"
              className="superadmin-logout-button"
              onClick={async () => {
                const { cerrarSesion } = await import('../../services/api')
                try { await cerrarSesion() } catch { /* noop */ }
                setUser(null)
                setAuthorized(false)
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="superadmin-main">
          <header className="superadmin-header">
            <div className="superadmin-header-inner">
              <div>
                <h2 className="superadmin-header-title">Panel de administración SaaS</h2>
                <p className="superadmin-header-copy">Gestiona locales, licencias y métricas desde un solo lugar.</p>
              </div>
            </div>
          </header>

<div className="superadmin-main-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
