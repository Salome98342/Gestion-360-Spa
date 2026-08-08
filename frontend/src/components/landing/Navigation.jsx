import { Link } from 'react-router-dom'

export default function Navigation({ empresa, slug }) {
  return (
    <nav className="tenant-nav">
<Link className="tenant-brand" to={`/${slug}`}>
        {empresa.logo_url ? (
          <img className="tenant-logo" src={empresa.logo_url} alt="Logo" />
        ) : (
          <span className="tenant-logo"><i className="fas fa-spa" style={{ fontSize: '1.3rem', color: 'var(--primary)' }}></i></span>
        )}
        <span className="tenant-brand-name">{empresa.nombre}</span>
      </Link>

      <div className="tenant-nav-links">
        <a href="#servicios">Servicios</a>
        <a href="#contacto">Contacto</a>
        <Link className="tenant-button" to={`/${slug}/agenda`}><i className="far fa-calendar-alt"></i> Agendar cita</Link>
      </div>
    </nav>
  )
}
