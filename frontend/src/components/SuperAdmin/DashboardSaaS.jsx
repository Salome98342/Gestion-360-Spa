import { useEffect, useState } from 'react'
import { listarEmpresasSuperAdmin, listarPlanesLicencia } from '../../services/api'
import './DashboardSaaS.css'

export default function DashboardSaaS() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ total: 0, activas: 0, sinAcceso: 0, sinPropietaria: 0, vencimientos: 0, planes: 0 })

  useEffect(() => {
    async function load() {
      try {
        const [companiesResponse, plansResponse] = await Promise.all([listarEmpresasSuperAdmin(), listarPlanesLicencia()])
        const empresas = companiesResponse.empresas || []
        const now = new Date(); const in30Days = new Date(); in30Days.setDate(now.getDate() + 30)
        setStats({
          total: empresas.length,
          activas: empresas.filter((item) => item.tiene_acceso).length,
          sinAcceso: empresas.filter((item) => !item.tiene_acceso).length,
          sinPropietaria: empresas.filter((item) => !item.propietario).length,
          vencimientos: empresas.filter((item) => { const date = item.licencia?.fecha_vencimiento && new Date(item.licencia.fecha_vencimiento); return date && date > now && date <= in30Days }).length,
          planes: (plansResponse.planes || []).length,
        })
      } catch (err) { setError(err.message) } finally { setLoading(false) }
    }
    load()
  }, [])

  const cards = [
    ['fa-store', 'Locales con acceso', stats.activas, 'dashboard-card-icon-primary'],
    ['fa-calendar-xmark', 'Vencen en 30 días', stats.vencimientos, 'dashboard-card-icon-warning'],
    ['fa-user-shield', 'Sin cuenta propietaria', stats.sinPropietaria, 'dashboard-card-icon-info'],
    ['fa-ban', 'Sin acceso', stats.sinAcceso, 'dashboard-card-icon-success'],
  ]
  return <div className="dashboard-saas">
    <div className="dashboard-saas-intro"><p className="manager-eyebrow">Centro de control</p><h2 className="dashboard-saas-title">Operación de tu plataforma</h2><p className="dashboard-saas-copy">Un resumen de accesos, vencimientos y cuentas de los negocios que administras.</p></div>
    {error && <div className="notice error">{error}</div>}
    {loading ? <p className="tenant-muted">Cargando indicadores…</p> : <><div className="dashboard-metrics">{cards.map(([icon, label, value, variant]) => <div className="dashboard-card" key={label}><div className={`dashboard-card-icon ${variant}`}><i className={`fas ${icon}`}></i></div><div className="dashboard-card-info"><p className="dashboard-card-summary">{label}</p><p className="dashboard-card-value">{value}</p></div></div>)}</div><div className="dashboard-overview-grid"><div className="dashboard-overview-card"><h3>Negocios registrados</h3><p className="dashboard-card-value">{stats.total}</p></div><div className="dashboard-overview-card"><h3>Planes disponibles</h3><p className="dashboard-card-value">{stats.planes}</p></div><div className="dashboard-overview-card"><h3>Acción recomendada</h3><p className="dashboard-card-summary">Revisa primero vencimientos y negocios sin cuenta.</p></div></div><div className="dashboard-graph-placeholder"><p><i className="fas fa-sparkles"></i> Desde “Locales, accesos y licencias” puedes crear negocios, entregar accesos y restablecer contraseñas.</p></div></>}
  </div>
}
