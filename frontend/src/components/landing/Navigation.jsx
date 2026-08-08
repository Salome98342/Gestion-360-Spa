import { Link } from 'react-router-dom'

export default function Navigation({ empresa, slug }) {
  return (
    <nav className="tenant-nav">
      <Link className="tenant-brand" to={`/${slug}`}>
        {empresa.logo_url ? (
          <img className="tenant-logo" src={empresa.logo_url} alt="Logo" />
        ) : (
          <span className="tenant-logo" />
        )}
        <span>{empresa.nombre}</span>
      </Link>

      <div className="tenant-nav-links">
        <a href="#servicios">Servicios</a>
        <a href="#contacto">Contacto</a>
        <Link className="tenant-button" to={`/${slug}/agenda`}>Agendar cita</Link>
      </div>
    </nav>
  )
}
