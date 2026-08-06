import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { landingPublico } from '../services/api'
import './LandingEmpresa.css'

const HERO_DEFAULT = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1100&q=85'

export default function LandingEmpresa() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [image, setImage] = useState(null)

  useEffect(() => {
    let active = true
    landingPublico(slug).then((payload) => { if (active) { setData(payload); setError('') } }).catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [slug])

  if (error) return <main className="tenant-state tenant-error">No fue posible cargar este negocio: {error}</main>
  if (!data) return <main className="tenant-state">Cargando la experiencia del negocio…</main>

  const { empresa, landing, servicios, sucursales } = data
  const gallery = (landing.galeria_urls || []).filter(Boolean)
  const title = landing.titulo_hero || empresa.nombre || ''
  const subtitle = landing.subtitulo_hero || ''
  const theme = { '--primary': empresa.color_primario || '#db2777', '--secondary': empresa.color_secundario || '#fff0f5' }

  return (
    <div className="tenant tenant-landing" style={theme}>
      <nav className="tenant-nav">
        <Link className="tenant-brand" to={`/${slug}`}>
          {empresa.logo_url ? <img className="tenant-logo" src={empresa.logo_url} alt="Logo" /> : <span className="tenant-logo" />}
          <span>{empresa.nombre}</span>
        </Link>

        <div className="tenant-nav-links">
          <a href="#servicios">Servicios</a>
          <a href="#contacto">Contacto</a>
          <Link className="tenant-button" to={`/${slug}/agenda`}>Agendar cita</Link>
        </div>
      </nav>

      <div className="tenant-hero-wrap">
        <header className="tenant-hero">
          <div className="tenant-hero-copy">
            {title && <div className="tenant-eyebrow">Bienvenido a</div>}
            <h1>{title}</h1>
            <p className="tenant-copy">{subtitle || 'Descubre un espacio creado para consentir tu belleza con servicios profesionales, ambiente exclusivo y una experiencia relajante.'}</p>
            <div className="tenant-actions">
              <Link className="tenant-button" to={`/${slug}/agenda`}>Reserva ahora</Link>
              <a className="tenant-button secondary" href="#servicios">Ver servicios</a>
            </div>
          </div>

          <div className="tenant-hero-media">
            <img className="tenant-hero-image" src={landing.imagen_hero_url || HERO_DEFAULT} alt={landing.titulo_hero || empresa.nombre} />
            <span className="tenant-hero-note"><i className="fas fa-sparkles"></i> Belleza a tu medida</span>
          </div>
        </header>
      </div>

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
                <div className="tenant-service-title"><span className="tenant-service-icon"><i className={`fas ${service.icono || 'fa-spa'}`}></i></span><h3>{service.nombre}</h3></div>
                <span className="tenant-card-badge">{service.duracion_minutos} min</span>
              </div>
              <p className="tenant-card-copy">{service.descripcion || 'Servicio profesional personalizado.'}</p>
              {landing.mostrar_precios && <div className="tenant-price">{Number(service.precio).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</div>}
            </article>
          ))}
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="tenant-section">
          <div className="tenant-section-header">
            <div>
              <span className="tenant-eyebrow">Inspiración</span>
              <h2>Galería de trabajo</h2>
            </div>
            <p className="tenant-muted">Mira algunos de nuestros resultados más cuidados.</p>
          </div>
          <div className="tenant-gallery">
            {gallery.map((url, index) => (
              <button key={url} type="button" className="tenant-gallery-item" onClick={() => setImage(url)}>
                <img src={url} alt={`Trabajo ${index + 1}`} />
              </button>
            ))}
          </div>
        </section>
      )}

      <footer id="contacto" className="tenant-footer">
        <div>
          <p className="tenant-footer-label">Contáctanos</p>
          <strong>{empresa.nombre}</strong>
          <p>{landing.texto_footer || 'Reserva tu espacio y vive una experiencia de belleza renovada.'}</p>
        </div>
        <div className="tenant-footer-info">
          {empresa.telefono && <p><span>Teléfono:</span> {empresa.telefono}</p>}
          {empresa.whatsapp && <p><span>WhatsApp:</span> {empresa.whatsapp}</p>}
          {sucursales[0] && <p><span>Dirección:</span> {sucursales[0].direccion || sucursales[0].nombre}</p>}
          <div className="tenant-socials">
            {landing.instagram_url && <a href={landing.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>}
            {landing.facebook_url && <a href={landing.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>}
            {landing.tiktok_url && <a href={landing.tiktok_url} target="_blank" rel="noreferrer" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>}
          </div>
        </div>
      </footer>

      {image && (
        <button className="lightbox" onClick={() => setImage(null)}>
          <img src={image} alt="Vista ampliada" />
        </button>
      )}
    </div>
  )
}
