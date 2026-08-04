import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  configuracionLanding,
  guardarConfiguracionLanding,
  iniciarSesion,
  sesionActual,
  cerrarSesion,
} from '../services/api'

const initialForm = {
  nombre: '',
  telefono: '',
  whatsapp: '',
  logo_url: '',
  color_primario: '#db2777',
  color_secundario: '#fff0f5',
  titulo_hero: '',
  subtitulo_hero: '',
  imagen_hero_url: '',
  texto_footer: '',
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  galeria_urls: [],
  mostrar_precios: true,
}

export default function DashboardAdmin() {
  const { slug } = useParams()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [login, setLogin] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  async function loadConfig() {
    setLoading(true)
    try {
      const session = await sesionActual()
      const config = await configuracionLanding()
      setUser(session.usuario)
      setForm({
        ...initialForm,
        ...config.empresa,
        ...config.landing,
        galeria_urls: config.landing.galeria_urls || [],
      })
    } catch {
      setUser(null)
      setForm(initialForm)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [slug])

  const update = (event) => {
    const { name, type, value, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function authenticate(event) {
    event.preventDefault()
    setError('')
    try {
      await iniciarSesion(login)
      await loadConfig()
    } catch (err) {
      setError(err.message)
    }
  }

  async function saveConfig(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await guardarConfiguracionLanding({
        ...form,
        galeria_urls: form.galeria_urls.filter(Boolean),
      })
      setForm({
        ...initialForm,
        ...response.empresa,
        ...response.landing,
        galeria_urls: response.landing.galeria_urls || [],
      })
      setMessage('Cambios guardados. La landing se actualizará inmediatamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    try {
      await cerrarSesion()
    } catch {
      // Ignorar error de cierre de sesión, seguir limpiando el estado
    }
    setUser(null)
    setForm(initialForm)
  }

  const galleryValue = (form.galeria_urls || []).join('\n')

  if (loading && !user) {
    return (
      <main className="admin-page">
        <div className="admin-card login-card">
          <h1>Cargando panel...</h1>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="admin-page">
        <form className="admin-card login-card" onSubmit={authenticate}>
          <h1>Panel del negocio</h1>
          <p className="tenant-muted">Ingresa con tu usuario de dueño para editar la landing.</p>
          {error && <div className="notice error">{error}</div>}

          <div className="settings-grid">
            <label className="full">
              Usuario
              <input
                value={login.username}
                onChange={(e) => setLogin({ ...login, username: e.target.value })}
                required
              />
            </label>
            <label className="full">
              Contraseña
              <input
                type="password"
                value={login.password}
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="tenant-button" type="submit">Entrar</button>
            <Link to={`/${slug}`} className="tenant-button secondary">Volver al sitio</Link>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-head">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link to={`/${user.empresa_slug || slug}`} className="text-sm text-slate-500 hover:text-slate-800">← Ver landing</Link>
              <h1 className="text-3xl font-bold text-slate-900">Personaliza tu landing</h1>
              <p className="tenant-muted">Los cambios se publican para los clientes de {user.empresa_nombre}.</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="tenant-button secondary"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <form className="admin-card" onSubmit={saveConfig}>
          {error && <div className="notice error">{error}</div>}
          {message && <div className="notice">{message}</div>}

          <section>
            <h2>Marca y colores</h2>
            <div className="settings-grid">
              <label>
                Nombre comercial
                <input name="nombre" value={form.nombre} onChange={update} required />
              </label>
              <label>
                Teléfono
                <input name="telefono" value={form.telefono} onChange={update} />
              </label>
              <label>
                WhatsApp
                <input name="whatsapp" value={form.whatsapp} onChange={update} />
              </label>
              <label>
                Logo (URL)
                <input name="logo_url" value={form.logo_url} onChange={update} placeholder="https://..." />
              </label>
              <label>
                Color principal
                <input name="color_primario" type="color" value={form.color_primario} onChange={update} />
              </label>
              <label>
                Color secundario
                <input name="color_secundario" type="color" value={form.color_secundario} onChange={update} />
              </label>
            </div>
          </section>

          <section>
            <h2>Portada y contenido</h2>
            <div className="settings-grid">
              <label className="full">
                Título principal
                <input name="titulo_hero" value={form.titulo_hero} onChange={update} />
              </label>
              <label className="full">
                Subtítulo
                <textarea name="subtitulo_hero" value={form.subtitulo_hero} onChange={update} />
              </label>
              <label className="full">
                Imagen de portada (URL)
                <input name="imagen_hero_url" value={form.imagen_hero_url} onChange={update} placeholder="https://..." />
              </label>
              <label className="full">
                Texto del footer
                <textarea name="texto_footer" value={form.texto_footer} onChange={update} />
              </label>
            </div>
          </section>

          <section>
            <h2>Redes sociales</h2>
            <div className="settings-grid">
              <label>
                Instagram
                <input name="instagram_url" value={form.instagram_url} onChange={update} placeholder="https://instagram.com/..." />
              </label>
              <label>
                Facebook
                <input name="facebook_url" value={form.facebook_url} onChange={update} placeholder="https://facebook.com/..." />
              </label>
              <label>
                TikTok
                <input name="tiktok_url" value={form.tiktok_url} onChange={update} placeholder="https://tiktok.com/@..." />
              </label>
              <label className="flex items-center gap-3 pt-6">
                <input name="mostrar_precios" type="checkbox" checked={form.mostrar_precios} onChange={update} />
                Mostrar precios en la landing
              </label>
            </div>
          </section>

          <section>
            <h2>Galería</h2>
            <label className="full">
              Una URL por línea
              <textarea
                name="galeria_urls"
                value={galleryValue}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    galeria_urls: event.target.value.split('\n').map((url) => url.trim()).filter(Boolean),
                  }))
                }
              />
            </label>
          </section>

          <div className="form-actions">
            <button className="tenant-button" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link to={`/${user.empresa_slug || slug}`} className="tenant-button secondary">
              Ver landing pública
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
