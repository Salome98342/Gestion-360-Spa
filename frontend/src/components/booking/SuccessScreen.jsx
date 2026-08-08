import { Link } from 'react-router-dom'

export default function SuccessScreen({ success, slug }) {
  return (
    <main className="tenant-state success-card">
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h1>¡Tu cita fue reservada!</h1>
      <div className="success-details">
        <p><strong>Servicio:</strong> {success.servicio}</p>
        {success.direccion && <p><strong>Dirección:</strong> {success.direccion}</p>}
        <p><strong>Fecha y hora:</strong> {success.fecha} a las {success.hora}</p>
      </div>
      <Link className="tenant-button" to={`/${slug}`}>Volver al inicio</Link>
    </main>
  )
}
