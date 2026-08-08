import { useMemo } from 'react'

export default function TabResumen({ servicios, productos, form, setTab }) {
  const overviewStats = useMemo(() => {
    const servicesCount = servicios.filter((item) => item.activo).length
    const productsCount = productos.filter((item) => item.activo).length
    return [
      { label: 'Servicios activos', value: servicesCount, icon: 'fa-hand-sparkles', accent: 'accent-pink' },
      { label: 'Productos', value: productsCount, icon: 'fa-boxes-stacked', accent: 'accent-violet' },
    ]
  }, [productos, servicios])

  return (
    <>
      <div className="admin-overview-grid">
        {overviewStats.map((item) => (
          <div key={item.label} className={`admin-overview-card ${item.accent}`}>
            <div className="admin-overview-icon">
              <i className={`fas ${item.icon}`}></i>
            </div>
            <div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </div>
          </div>
        ))}
      </div>
      <section className="admin-card admin-welcome-card">
        <div>
          <p className="admin-preview-label">Tu espacio de trabajo</p>
          <h2>Todo lo esencial, sin complicaciones.</h2>
          <p className="tenant-muted">Actualiza la imagen de tu marca, organiza servicios y mantén el inventario al día desde un solo lugar.</p>
        </div>
        <div className="admin-quick-actions">
          <button type="button" className="tenant-button" onClick={() => setTab('landing')}>Personalizar landing</button>
          <button type="button" className="tenant-button secondary" onClick={() => setTab('productos')}>Revisar inventario</button>
        </div>
      </section>
    </>
  )
}
