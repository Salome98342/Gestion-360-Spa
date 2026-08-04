import { NavLink, Outlet } from 'react-router-dom'

function navLinkClass({ isActive }) {
  return `block rounded-2xl px-4 py-3 transition-colors text-sm font-medium ${
    isActive ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`
}

export default function SuperAdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-72 bg-slate-950 text-white flex flex-col">
          <div className="px-6 py-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-3xl bg-pink-500 grid place-items-center text-2xl shadow-lg">
                <i className="fas fa-spa"></i>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Glow SaaS</p>
                <h1 className="text-2xl font-bold">Administrador</h1>
              </div>
            </div>
          </div>

          <nav className="p-6 space-y-2 flex-1">
            <NavLink to="/superadmin" end className={navLinkClass}>
              <i className="fas fa-chart-line w-4"></i> Resumen SaaS
            </NavLink>
            <NavLink to="/superadmin/empresas" className={navLinkClass}>
              <i className="fas fa-store w-4"></i> Locales y licencias
            </NavLink>
          </nav>

          <div className="p-6 border-t border-slate-800 text-slate-400 text-sm">
            <p className="font-semibold text-slate-300 mb-3">Panel de servicio</p>
            <p>Actualizaciones en tiempo real</p>
          </div>
        </aside>

        <main className="flex-1">
          <header className="bg-white border-b border-slate-200 p-6">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-2xl font-semibold text-slate-900">Panel de administración SaaS</h2>
              <p className="mt-1 text-slate-600">Gestiona locales, licencias y métricas desde un solo lugar.</p>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
