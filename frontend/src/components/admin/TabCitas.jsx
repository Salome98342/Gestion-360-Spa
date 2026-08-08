import { formatMoney } from '../../utils/adminConstants'

export default function TabCitas({ citas, citasError, loadCitas, confirmarPorWhatsApp }) {
  return (
    <section className="admin-card">
      <div className="admin-section-header">
        <div>
          <h2 className="section-title">Reservas recibidas</h2>
          <p className="tenant-muted">Solicitudes realizadas desde tu landing.</p>
        </div>
        <button type="button" className="tenant-button secondary" onClick={loadCitas}>Actualizar</button>
      </div>
      
      {citasError && <div className="notice error">{citasError}</div>}
      
      {citas.length === 0 ? (
        <p className="tenant-muted">Aún no hay reservas registradas.</p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha y hora</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Confirmación</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id}>
                  <td>
                    <div className="table-cell-title">{cita.cliente}</div>
                    {cita.notas && <div className="table-note">{cita.notas}</div>}
                  </td>
                  <td>
                    {cita.servicio}
                    <div className="table-note">{cita.duracion_minutos} min · {formatMoney(cita.precio)}</div>
                  </td>
                  <td>
                    {new Date(`${cita.fecha}T00:00:00`).toLocaleDateString('es-CO')}
                    <div className="table-note">{cita.hora}</div>
                  </td>
                  <td>
                    {cita.telefono}
                    {cita.email && <div className="table-note">{cita.email}</div>}
                  </td>
                  <td>
                    <span className={`status-pill ${cita.estado === 'CANCELADA' ? 'inactive' : 'active'}`}>
                      {cita.estado}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="whatsapp-confirm" onClick={() => confirmarPorWhatsApp(cita)} title="Abrir mensaje de confirmación en WhatsApp">
                      <i className="fab fa-whatsapp"></i> Confirmar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
