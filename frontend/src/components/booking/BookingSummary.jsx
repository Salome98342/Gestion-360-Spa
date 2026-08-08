import { formatCurrency, formatDateLabel } from '../../utils/formatters'

export default function BookingSummary({ landing, form, selectedService }) {
  return (
    <aside className="booking-summary-card">
      <div className="summary-chip">Resumen</div>
      <h3>{selectedService ? selectedService.nombre : 'Tu próximo tratamiento'}</h3>
      <p>{selectedService ? selectedService.descripcion || 'Servicio seleccionado para tu bienestar.' : 'Elige un servicio para ver el detalle aquí.'}</p>

      <div className="summary-list">
        {landing.empresa.direccion && (
          <div className="summary-item">
            <span>Dirección</span>
            <strong>{landing.empresa.direccion}</strong>
          </div>
        )}
        <div className="summary-item">
          <span>Fecha</span>
          <strong>{formatDateLabel(form.fecha)}</strong>
        </div>
        <div className="summary-item">
          <span>Hora</span>
          <strong>{form.hora || 'Por escoger'}</strong>
        </div>
        <div className="summary-item highlight">
          <span>Precio estimado</span>
          <strong>{selectedService ? formatCurrency(selectedService.precio) : '—'}</strong>
        </div>
      </div>
    </aside>
  )
}
