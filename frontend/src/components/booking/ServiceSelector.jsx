import { formatCurrency } from '../../utils/formatters'

export default function ServiceSelector({ services, form, setFieldValue, fieldErrors }) {
  return (
    <section className="booking-section">
      <div className="booking-section-header">
        <div>
          <h2>1. Elige tu servicio</h2>
          <p>Selecciona la experiencia que quieres vivir hoy.</p>
        </div>
        <span className="booking-badge">{services.length} opciones</span>
      </div>

      <div className="service-grid">
        {services.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`service-option ${String(item.id) === String(form.servicio_id) ? 'selected' : ''}`}
            onClick={() => setFieldValue('servicio_id', String(item.id))}
          >
            <div className="service-option-icon">
              <i className={`fas ${item.icono || 'fa-spa'}`}></i>
            </div>
            <div className="service-option-body">
              <strong>{item.nombre}</strong>
              <p>{item.descripcion || 'Servicio pensado para tu comodidad y bienestar.'}</p>
              <span>{item.duracion_minutos} min · {formatCurrency(item.precio)}</span>
            </div>
          </button>
        ))}
      </div>
      {fieldErrors.servicio_id && <p className="field-error">{fieldErrors.servicio_id}</p>}
    </section>
  )
}
