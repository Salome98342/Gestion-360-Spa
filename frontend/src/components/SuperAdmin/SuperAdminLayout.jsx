import './SuperAdminLayout.css'
import { NavLink, Outlet } from 'react-router-dom'

function navLinkClass({ isActive }) {
  return `superadmin-link ${isActive ? 'active' : ''}`
}

export default function SuperAdminLayout() {
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
            <p className="superadmin-footer-label">Panel de servicio</p>
            <p className="superadmin-footer-copy">Actualizaciones en tiempo real</p>
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
