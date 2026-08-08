import { Link } from 'react-router-dom'
import { HERO_DEFAULT } from '../../utils/landingConstants'

export default function Hero({ empresa, landing, slug }) {
  const title = landing.titulo_hero || empresa.nombre || ''
  const subtitle = landing.subtitulo_hero || 'Descubre un espacio creado para consentir tu belleza con servicios profesionales, ambiente exclusivo y una experiencia relajante.'

  return (
    <div className="tenant-hero-wrap">
      <header className="tenant-hero">
        <div className="tenant-hero-copy">
          {title && <div className="tenant-eyebrow">Bienvenido a</div>}
          <h1>{title}</h1>
          <p className="tenant-copy">{subtitle}</p>
          <div className="tenant-actions">
            <Link className="tenant-button" to={`/${slug}/agenda`}>Reserva ahora</Link>
            <a className="tenant-button secondary" href="#servicios">Ver servicios</a>
          </div>
        </div>

        <div className="tenant-hero-media">
          <img 
            className="tenant-hero-image" 
            src={landing.imagen_hero_url || HERO_DEFAULT} 
            alt={landing.titulo_hero || empresa.nombre} 
          />
          <span className="tenant-hero-note">
            <i className="fas fa-sparkles"></i> Belleza a tu medida
          </span>
        </div>
      </header>
    </div>
  )
}
