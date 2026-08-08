import { formatMoney } from '../../utils/landingConstants'

export default function Services({ servicios, showPrices }) {
  return (
    <section id="servicios" className="tenant-section tenant-services">
      <div className="tenant-section-header">
        <div>
          <span className="tenant-eyebrow">Servicios</span>
          <h2>Elige tu tratamiento ideal</h2>
        </div>
        <p className="tenant-muted">Explora nuestro catálogo con tiempos reales y opciones diseñadas para tu comodidad.</p>
      </div>

      <div className="tenant-grid">
        {servicios.map((service) => (
          <article className="tenant-card" key={service.id}>
            <div className="tenant-card-heading">
              <div className="tenant-service-title">
                <span className="tenant-service-icon">
                  <i className={`fas ${service.icono || 'fa-spa'}`}></i>
                </span>
                <h3>{service.nombre}</h3>
              </div>
              <span className="tenant-card-badge">{service.duracion_minutos} min</span>
            </div>
            <p className="tenant-card-copy">
              {service.descripcion || 'Servicio profesional personalizado.'}
            </p>
            {showPrices && (
              <div className="tenant-price">
                {formatMoney(service.precio)}
                <span className="tenant-price-hint">
                  <i className="far fa-clock"></i> {service.duracion_minutos} min
                </span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
