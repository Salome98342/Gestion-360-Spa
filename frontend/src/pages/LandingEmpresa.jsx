import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { landingPublico } from '../services/api'

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
  const title = landing.titulo_hero || `Belleza hecha para ti en ${empresa.nombre}`
  const subtitle = landing.subtitulo_hero || 'Agenda en pocos pasos y disfruta un espacio pensado para ti.'
  const theme = { '--primary': empresa.color_primario || '#db2777', '--secondary': empresa.color_secundario || '#fff0f5' }

  return <div className="tenant" style={theme}>
    <nav className="tenant-nav">
      <Link className="tenant-brand" to={`/${slug}`}>
        {empresa.logo_url ? <img className="tenant-logo" src={empresa.logo_url} alt="Logo" /> : <span className="tenant-logo" />}
        {empresa.nombre}
      </Link>
      <div className="tenant-nav-links"><a href="#servicios">Servicios</a><a href="#contacto">Contacto</a><Link className="tenant-button" to={`/${slug}/agenda`}>Agendar cita</Link></div>
    </nav>
    <div className="tenant-hero-wrap"><header className="tenant-hero">
      <div><div className="tenant-eyebrow">Tu espacio de bienestar</div><h1>{title}</h1><p className="tenant-copy">{subtitle}</p><div className="tenant-actions"><Link className="tenant-button" to={`/${slug}/agenda`}>Reserva ahora</Link><a className="tenant-button secondary" href="#servicios">Ver servicios</a></div></div>
      <img className="tenant-hero-image" src={landing.imagen_hero_url || HERO_DEFAULT} alt={empresa.nombre} />
    </header></div>
    <section id="servicios" className="tenant-section tenant-services"><h2>Servicios</h2><p className="tenant-muted">Elige el servicio ideal y reserva el horario que prefieras.</p><div className="tenant-grid">{servicios.map((service) => <article className="tenant-card" key={service.id}><h3>{service.nombre}</h3><p className="tenant-muted">{service.descripcion || 'Servicio profesional personalizado.'}</p><p className="tenant-muted">{service.duracion_minutos} minutos</p>{landing.mostrar_precios && <div className="tenant-price">${Number(service.precio).toLocaleString('es-CO')}</div>}</article>)}</div></section>
    {gallery.length > 0 && <section className="tenant-section"><h2>Galería</h2><div className="tenant-gallery">{gallery.map((url, index) => <img key={url} src={url} alt={`Trabajo ${index + 1}`} onClick={() => setImage(url)} />)}</div></section>}
    <footer id="contacto" className="tenant-footer"><div><strong>{empresa.nombre}</strong><p>{landing.texto_footer || 'Agenda tu cita y vive una experiencia única.'}</p></div><div>{empresa.telefono && <p>Teléfono: {empresa.telefono}</p>}{empresa.whatsapp && <p>WhatsApp: {empresa.whatsapp}</p>}{sucursales[0] && <p>{sucursales[0].direccion || sucursales[0].nombre}</p>}</div></footer>
    {image && <button className="lightbox" onClick={() => setImage(null)}><img src={image} alt="Vista ampliada" /></button>}
  </div>
}
