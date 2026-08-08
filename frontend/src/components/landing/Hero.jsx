import { Link } from 'react-router-dom'
import { HERO_DEFAULT } from '../../utils/landingConstants'
import { resolveImageUrl } from '../../services/api'

function splitTitle(title) {
  if (!title) return { before: '', accent: '' }
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return { before: title, accent: '' }
  const accent = words.pop()
  return { before: words.join(' '), accent }
}

export default function Hero({ empresa, landing, slug }) {
  const title = landing.titulo_hero || empresa.nombre || ''
  const subtitle = landing.subtitulo_hero || 'Descubre un espacio creado para consentir tu belleza con servicios profesionales, ambiente exclusivo y una experiencia relajante.'
  const { before, accent } = splitTitle(title)

  return (
    <div className="tenant-hero-wrap">
      <div className="tenant-hero-glow" aria-hidden="true" />
      <header className="tenant-hero">
        <div className="tenant-hero-copy">
          {title && (
            <span className="tenant-eyebrow">
              <i className="fas fa-sparkles"></i> Bienvenida a
            </span>
          )}
          <h1>
            {before} {accent && <span className="accent">{accent}</span>}
          </h1>
          <p className="tenant-copy">{subtitle}</p>
          <div className="tenant-actions">
            <Link className="tenant-button" to={`/${slug}/agenda`}>
              Reserva ahora <i className="fas fa-arrow-right"></i>
            </Link>
            <a className="tenant-button secondary" href="#servicios">Ver servicios</a>
          </div>
        </div>

        <div className="tenant-hero-media">
<img 
            className="tenant-hero-image" 
            src={resolveImageUrl(landing.imagen_hero_url || HERO_DEFAULT)} 
            alt={landing.titulo_hero || empresa.nombre} 
          />
          <div className="tenant-badge badge-top">
            <span className="tenant-badge-icon"><i className="fas fa-star"></i></span>
            <div>
              <strong>4.9 / 5</strong>
              <small>Valoración de clientas</small>
            </div>
          </div>
          <div className="tenant-badge badge-bottom">
            <span className="tenant-badge-icon"><i className="fas fa-heart"></i></span>
            <div>
              <strong>+500 clientas</strong>
              <small>felices y consentidas</small>
            </div>
          </div>
          <span className="tenant-hero-note">
            <i className="fas fa-sparkles"></i> Belleza a tu medida
          </span>
        </div>
      </header>
    </div>
  )
}
