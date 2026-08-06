import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import './DashboardAdmin.css'
import {
  configuracionLanding,
  guardarConfiguracionLanding,
  subirImagen,
  iniciarSesion,
  sesionActual,
  cerrarSesion,
  listarServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  listarVentas,
  listarCitasEmpresa,
  listarProductos,
  crearProducto,
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

const emptyServicio = { nombre: '', descripcion: '', precio: '', duracion_minutos: 30, icono: 'fa-hand-sparkles', activo: true, orden: 0 }
const emptyProducto = { nombre: '', codigo_barras: '', descripcion: '', precio_venta: '', costo: '0', stock_actual: 0 }

const formatMoney = (value) => Number(value || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

export default function DashboardAdmin() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('resumen')
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [login, setLogin] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [loading, setLoading] = useState(true)

  // ── Servicios ──────────────────────────────────────────────
  const [servicios, setServicios] = useState([])
  const [servicioForm, setServicioForm] = useState(emptyServicio)
  const [editingServicioId, setEditingServicioId] = useState(null)
  const [servicioError, setServicioError] = useState('')
  const [servicioSaving, setServicioSaving] = useState(false)

  // ── Productos ──────────────────────────────────────────────
  const [productos, setProductos] = useState([])
  const [productoForm, setProductoForm] = useState(emptyProducto)
  const [productoError, setProductoError] = useState('')
  const [productoSaving, setProductoSaving] = useState(false)

  // ── Ventas ─────────────────────────────────────────────────
  const [ventas, setVentas] = useState([])
  const [ventasError, setVentasError] = useState('')

  // ── Citas recibidas desde la landing ───────────────────────
  const [citas, setCitas] = useState([])
  const [citasError, setCitasError] = useState('')

  async function loadConfig() {
    setLoading(true)
    try {
      const session = await sesionActual()
      if (session.usuario.empresa_slug !== slug || session.usuario.rol !== 'DUENO') {
        await cerrarSesion()
        setError('Inicia sesión con la cuenta dueña de este negocio.')
        setUser(null)
        return
      }
      const config = await configuracionLanding()
      setUser(session.usuario)
      setForm({
        ...initialForm,
        ...config.empresa,
        ...config.landing,
        galeria_urls: config.landing.galeria_urls || [],
      })
    } catch (err) {
      setUser(null)
      setForm(initialForm)
      if (err && err.message && err.message.indexOf('No autenticado') === -1) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadServicios() {
    setServicioError('')
    try {
      const data = await listarServicios()
      setServicios(data.servicios || [])
    } catch (err) {
      setServicioError(err.message)
    }
  }

  async function loadProductos() {
    setProductoError('')
    try {
      const data = await listarProductos()
      setProductos(data.productos || [])
    } catch (err) {
      setProductoError(err.message)
    }
  }

  async function loadVentas() {
    setVentasError('')
    try {
      const data = await listarVentas()
      setVentas(data.ventas || [])
    } catch (err) {
      setVentasError(err.message)
    }
  }

  async function loadCitas() {
    setCitasError('')
    try {
      const data = await listarCitasEmpresa()
      setCitas(data.citas || [])
    } catch (err) {
      setCitasError(err.message)
    }
  }

  useEffect(() => {
    async function init() {
      await loadConfig()
    }
    init()
  }, [slug])

  // Cargar servicios, productos y ventas al iniciar sesión para que las
  // estadísticas del panel no aparezcan en 0.
  useEffect(() => {
    async function refreshData() {
      if (!user) return
      await Promise.all([loadServicios(), loadVentas(), loadCitas()])
    }
    refreshData()
  }, [user])

  // Al cambiar de pestaña, refrescar los datos correspondientes.
  useEffect(() => {
    async function refreshOnTab() {
      if (!user) return
      if (tab === 'servicios') await loadServicios()
      if (tab === 'ventas') await loadVentas()
      if (tab === 'citas') await loadCitas()
    }
    refreshOnTab()
  }, [tab])

  const update = (event) => {
    const { name, type, value, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function uploadImage(event, field, multiple = false) {
    const archivos = Array.from(event.target.files || [])
    if (!archivos.length) return
    setError('')
    setMessage('')
    setUploading(field)
    try {
      const opciones = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, fileType: 'image/webp' }
      const urls = []
      for (const archivo of archivos) {
        if (!archivo.type.startsWith('image/')) throw new Error('Selecciona solamente archivos de imagen.')
        const optimizada = await imageCompression(archivo, opciones)
        const { url } = await subirImagen(optimizada)
        urls.push(url)
      }
      setForm((current) => multiple
        ? { ...current, galeria_urls: [...(current.galeria_urls || []), ...urls] }
        : { ...current, [field]: urls[0] })
      setMessage(`${urls.length > 1 ? 'Las imágenes se optimizaron y cargaron' : 'La imagen se optimizó y cargó'}. Guarda los cambios para publicarlos.`)
    } catch (err) {
      setError(err.message || 'No fue posible optimizar o cargar la imagen.')
    } finally {
      event.target.value = ''
      setUploading('')
    }
  }

  function removeGalleryImage(url) {
    setForm((current) => ({ ...current, galeria_urls: (current.galeria_urls || []).filter((item) => item !== url) }))
  }

  async function authenticate(event) {
    event.preventDefault()
    setError('')
    try {
      await iniciarSesion({ ...login, empresa_slug: slug })
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
    setServicios([])
    setProductos([])
    setVentas([])
    setTab('resumen')
  }

  // ── Handlers Servicios ─────────────────────────────────────
  const updateServicio = (event) => {
    const { name, type, value, checked } = event.target
    setServicioForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const startEditServicio = (servicio) => {
    setEditingServicioId(servicio.id)
    setServicioForm({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precio: servicio.precio,
      duracion_minutos: servicio.duracion_minutos,
      icono: servicio.icono || 'fa-hand-sparkles',
      activo: servicio.activo,
      orden: servicio.orden,
    })
    setTab('servicios')
  }

  const resetServicioForm = () => {
    setEditingServicioId(null)
    setServicioForm(emptyServicio)
    setServicioError('')
  }

  async function submitServicio(event) {
    event.preventDefault()
    setServicioSaving(true)
    setServicioError('')
    try {
      if (editingServicioId) {
        await actualizarServicio(editingServicioId, {
          ...servicioForm,
          duracion_minutos: Number(servicioForm.duracion_minutos),
          orden: Number(servicioForm.orden || 0),
        })
      } else {
        await crearServicio({
          ...servicioForm,
          duracion_minutos: Number(servicioForm.duracion_minutos),
          orden: Number(servicioForm.orden || 0),
        })
      }
      resetServicioForm()
      await loadServicios()
    } catch (err) {
      setServicioError(err.message)
    } finally {
      setServicioSaving(false)
    }
  }

  async function removeServicio(id) {
    if (!window.confirm('¿Deseas eliminar (desactivar) este servicio?')) return
    setServicioError('')
    try {
      await eliminarServicio(id)
      await loadServicios()
    } catch (err) {
      setServicioError(err.message)
    }
  }

  // ── Handlers Productos ─────────────────────────────────────
  const updateProducto = (event) => {
    const { name, value } = event.target
    setProductoForm((current) => ({ ...current, [name]: value }))
  }

  const resetProductoForm = () => {
    setProductoForm(emptyProducto)
    setProductoError('')
  }

  async function submitProducto(event) {
    event.preventDefault()
    setProductoSaving(true)
    setProductoError('')
    try {
      await crearProducto({
        ...productoForm,
        stock_actual: Number(productoForm.stock_actual || 0),
      })
      resetProductoForm()
      await loadProductos()
    } catch (err) {
      setProductoError(err.message)
    } finally {
      setProductoSaving(false)
    }
  }

  const overviewStats = useMemo(() => {
    const servicesCount = servicios.filter((item) => item.activo).length
    const productsCount = productos.filter((item) => item.activo).length
    const salesCount = ventas.length

    return [
      {
        label: 'Servicios activos',
        value: servicesCount,
        icon: 'fa-hand-sparkles',
        accent: 'accent-pink',
      },
      {
        label: 'Productos',
        value: productsCount,
        icon: 'fa-boxes-stacked',
        accent: 'accent-violet',
      },
      {
        label: 'Ventas registradas',
        value: salesCount,
        icon: 'fa-receipt',
        accent: 'accent-sky',
      },
    ]
  }, [productos, servicios, ventas])

  const previewTheme = {
    '--preview-primary': form.color_primario || '#db2777',
    '--preview-secondary': form.color_secundario || '#fff0f5',
  }

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
          <p className="tenant-muted">Ingresa con tu usuario de dueño para administrar tu negocio.</p>
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

  const tabs = [
    { key: 'resumen', label: 'Resumen', icon: 'fa-chart-pie' },
    { key: 'landing', label: 'Mi landing', icon: 'fa-wand-magic-sparkles' },
    { key: 'citas', label: 'Reservas', icon: 'fa-calendar-check' },
    { key: 'servicios', label: 'Servicios', icon: 'fa-hand-sparkles' },
    { key: 'ventas', label: 'Ventas', icon: 'fa-receipt' },
  ]

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-head">
          <div className="admin-head-grid">
            <div>
              <Link to={`/${user.empresa_slug || slug}`} className="admin-back-link">← Ver landing</Link>
              <h1 className="admin-page-title">Panel del negocio</h1>
              <p className="tenant-muted">Administrando {user.empresa_nombre}.</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="tenant-button secondary"
            >
              Cerrar sesión
            </button>
          </div>

          <nav className="admin-tabs">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`admin-tab ${tab === item.key ? 'active' : ''}`}
                onClick={() => setTab(item.key)}
              >
                <i className={`fas ${item.icon} admin-tab-icon`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        {tab === 'resumen' && (
          <>
            <div className="admin-overview-grid">
              {overviewStats.map((item) => (
                <div key={item.label} className={`admin-overview-card ${item.accent}`}>
                  <div className="admin-overview-icon">
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div>
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                  </div>
                </div>
              ))}
            </div>
            <section className="admin-card admin-welcome-card">
              <div>
                <p className="admin-preview-label">Tu espacio de trabajo</p>
                <h2>Todo lo esencial, sin complicaciones.</h2>
                <p className="tenant-muted">Actualiza la imagen de tu marca, organiza servicios y mantén el inventario al día desde un solo lugar.</p>
              </div>
              <div className="admin-quick-actions">
                <button type="button" className="tenant-button" onClick={() => setTab('landing')}>Personalizar landing</button>
                <button type="button" className="tenant-button secondary" onClick={() => setTab('productos')}>Revisar inventario</button>
              </div>
            </section>
          </>
        )}

        {tab === 'landing' && (
          <form className="admin-card" onSubmit={saveConfig}>
            {error && <div className="notice error">{error}</div>}
            {message && <div className="notice">{message}</div>}

            <div className="admin-preview-card" style={previewTheme}>
              <div>
                <p className="admin-preview-label">Vista previa rápida</p>
                <h3>{form.titulo_hero || 'Tu landing lucirá mucho mejor con una portada clara'}</h3>
                <p>{form.subtitulo_hero || 'Haz que cada visita se sienta especial y conviértela en una reserva.'}</p>
              </div>
              <span className="admin-preview-pill">Reserva ahora</span>
            </div>

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
                <label className="image-upload-field">
                  Logo
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadImage(event, 'logo_url')} disabled={uploading === 'logo_url'} />
                  <small>Se optimiza automáticamente a máximo 1 MB y 1024 px.</small>
                  {uploading === 'logo_url' && <span className="image-upload-status">Optimizando y cargando...</span>}
                  {form.logo_url && <img className="image-upload-preview logo" src={form.logo_url} alt="Vista previa del logo" />}
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
                <label className="full image-upload-field">
                  Imagen de portada
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadImage(event, 'imagen_hero_url')} disabled={uploading === 'imagen_hero_url'} />
                  <small>Se optimiza automáticamente antes de subirla.</small>
                  {uploading === 'imagen_hero_url' && <span className="image-upload-status">Optimizando y cargando...</span>}
                  {form.imagen_hero_url && <img className="image-upload-preview hero" src={form.imagen_hero_url} alt="Vista previa de portada" />}
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
                <label className="admin-checkbox-row">
                  <input name="mostrar_precios" type="checkbox" checked={form.mostrar_precios} onChange={update} />
                  Mostrar precios en la landing
                </label>
              </div>
            </section>

            <section>
              <h2>Galería</h2>
              <label className="full image-upload-field">
                Imágenes de la galería
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => uploadImage(event, 'galeria_urls', true)} disabled={uploading === 'galeria_urls'} />
                <small>Puedes seleccionar varias imágenes; cada una se comprime antes de cargarse.</small>
                {uploading === 'galeria_urls' && <span className="image-upload-status">Optimizando y cargando imágenes...</span>}
              </label>
              {(form.galeria_urls || []).length > 0 && <div className="gallery-upload-preview">
                {form.galeria_urls.map((url) => <div key={url}><img src={url} alt="Imagen de galería" /><button type="button" onClick={() => removeGalleryImage(url)} aria-label="Quitar imagen">×</button></div>)}
              </div>}
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
        )}

        {tab === 'servicios' && (
          <div className="admin-card">
            <div className="admin-section-header">
              <h2 className="section-title">Gestión de Servicios</h2>
            </div>
            {servicioError && <div className="notice error">{servicioError}</div>}

            <form className="admin-card-inner" onSubmit={submitServicio}>
              <div className="admin-section-header compact">
                <h3>{editingServicioId ? 'Editar servicio' : 'Nuevo servicio'}</h3>
                <span className="admin-inline-pill">{editingServicioId ? 'Modo edición' : 'Agregar al catálogo'}</span>
              </div>
              <div className="settings-grid">
                <label className="full">
                  Nombre
                  <input name="nombre" value={servicioForm.nombre} onChange={updateServicio} required />
                </label>
                <label className="full">
                  Descripción
                  <textarea name="descripcion" value={servicioForm.descripcion} onChange={updateServicio} />
                </label>
                <label>
                  Precio (COP)
                  <input name="precio" type="number" step="0.01" min="0" value={servicioForm.precio} onChange={updateServicio} required />
                </label>
                <label>
                  Duración (minutos)
                  <input name="duracion_minutos" type="number" min="1" value={servicioForm.duracion_minutos} onChange={updateServicio} required />
                </label>
                <label>
                  Orden
                  <input name="orden" type="number" value={servicioForm.orden} onChange={updateServicio} />
                </label>
                <label>
                  Ícono (FontAwesome)
                  <input name="icono" value={servicioForm.icono} onChange={updateServicio} />
                </label>
                <label className="admin-checkbox-row">
                  <input name="activo" type="checkbox" checked={servicioForm.activo} onChange={updateServicio} />
                  Activo
                </label>
              </div>
              <div className="form-actions">
                <button className="tenant-button" type="submit" disabled={servicioSaving}>
                  {servicioSaving ? 'Guardando...' : (editingServicioId ? 'Guardar cambios' : 'Agregar servicio')}
                </button>
                {editingServicioId && (
                  <button className="tenant-button secondary" type="button" onClick={resetServicioForm}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6">
              <h3 className="section-title">Servicios actuales</h3>
              {servicios.length === 0 ? (
                <p className="tenant-muted">Aún no tienes servicios. Agrega el primero.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Duración</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th className="table-cell-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicios.map((servicio) => (
                        <tr key={servicio.id}>
                          <td>
                            <div className="table-cell-title">
                              <i className={`fas ${servicio.icono || 'fa-spa'} table-icon`}></i>
                              {servicio.nombre}
                            </div>
                            {servicio.descripcion && <div className="table-note">{servicio.descripcion}</div>}
                          </td>
                          <td>{servicio.duracion_minutos} min</td>
                          <td>{formatMoney(servicio.precio)}</td>
                          <td>
                            <span className={`status-pill ${servicio.activo ? 'active' : 'inactive'}`}>
                              {servicio.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="table-cell-center">
                            <div className="admin-action-group">
                              <button className="admin-action-button" title="Editar" onClick={() => startEditServicio(servicio)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="admin-action-button admin-action-button-danger" title="Eliminar" onClick={() => removeServicio(servicio.id)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'productos' && (
          <div className="admin-card">
            <h2 className="section-title">Gestión de Productos</h2>
            {productoError && <div className="notice error">{productoError}</div>}

            <form className="admin-card-inner" onSubmit={submitProducto}>
              <h3>Nuevo producto</h3>
              <div className="settings-grid">
                <label className="full">
                  Nombre
                  <input name="nombre" value={productoForm.nombre} onChange={updateProducto} required />
                </label>
                <label className="full">
                  Descripción
                  <textarea name="descripcion" value={productoForm.descripcion} onChange={updateProducto} />
                </label>
                <label>
                  Precio de venta (COP)
                  <input name="precio_venta" type="number" step="0.01" min="0" value={productoForm.precio_venta} onChange={updateProducto} required />
                </label>
                <label>
                  Costo (COP)
                  <input name="costo" type="number" step="0.01" min="0" value={productoForm.costo} onChange={updateProducto} />
                </label>
                <label>
                  Stock
                  <input name="stock_actual" type="number" min="0" value={productoForm.stock_actual} onChange={updateProducto} required />
                </label>
                <label>
                  Código de barras
                  <input name="codigo_barras" value={productoForm.codigo_barras} onChange={updateProducto} />
                </label>
              </div>
              <div className="form-actions">
                <button className="tenant-button" type="submit" disabled={productoSaving}>
                  {productoSaving ? 'Guardando...' : 'Agregar producto'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <h3>Productos actuales</h3>
              {productos.length === 0 ? (
                <p className="tenant-muted">Aún no tienes productos. Agrega el primero.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Código</th>
                        <th>Precio venta</th>
                        <th>Costo</th>
                        <th>Stock</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((producto) => (
                        <tr key={producto.id}>
                          <td>
                            <div className="table-cell-title">{producto.nombre}</div>
                            {producto.descripcion && <div className="table-note">{producto.descripcion}</div>}
                          </td>
                          <td>{producto.codigo_barras || '—'}</td>
                          <td>{formatMoney(producto.precio_venta)}</td>
                          <td>{formatMoney(producto.costo)}</td>
                          <td>{producto.stock_actual}</td>
                          <td>
                            <span className={`status-pill ${producto.activo ? 'active' : 'inactive'}`}>
                              {producto.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'citas' && (
          <section className="admin-card">
            <div className="admin-section-header">
              <div><h2 className="section-title">Reservas recibidas</h2><p className="tenant-muted">Solicitudes realizadas desde tu landing.</p></div>
              <button type="button" className="tenant-button secondary" onClick={loadCitas}>Actualizar</button>
            </div>
            {citasError && <div className="notice error">{citasError}</div>}
            {citas.length === 0 ? <p className="tenant-muted">Aún no hay reservas registradas.</p> : <div className="table-wrapper"><table className="admin-table"><thead><tr><th>Cliente</th><th>Servicio</th><th>Fecha y hora</th><th>Contacto</th><th>Estado</th></tr></thead><tbody>
              {citas.map((cita) => <tr key={cita.id}><td><div className="table-cell-title">{cita.cliente}</div>{cita.notas && <div className="table-note">{cita.notas}</div>}</td><td>{cita.servicio}<div className="table-note">{cita.duracion_minutos} min · {formatMoney(cita.precio)}</div></td><td>{new Date(`${cita.fecha}T00:00:00`).toLocaleDateString('es-CO')}<div className="table-note">{cita.hora}</div></td><td>{cita.telefono}{cita.email && <div className="table-note">{cita.email}</div>}</td><td><span className={`status-pill ${cita.estado === 'CANCELADA' ? 'inactive' : 'active'}`}>{cita.estado}</span></td></tr>)}
            </tbody></table></div>}
          </section>
        )}

        {tab === 'ventas' && (
          <div className="admin-card">
            <h2 className="section-title">Historial de Ventas</h2>
            {ventasError && <div className="notice error">{ventasError}</div>}
            {ventas.length === 0 ? (
              <p className="tenant-muted">Aún no hay ventas registradas.</p>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((venta) => (
                      <tr key={venta.id}>
                        <td>#{venta.id}</td>
                        <td>{new Date(venta.fecha_emision).toLocaleString('es-CO')}</td>
                        <td>{formatMoney(venta.total)}</td>
                        <td>
                          <span className={`status-pill ${venta.estado === 'COMPLETADA' ? 'active' : venta.estado === 'PENDIENTE' ? 'warning' : 'inactive'}`}>
                            {venta.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
</div>
    </main>
  )
}
