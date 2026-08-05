﻿import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './DashboardAdmin.css'
import {
  configuracionLanding,
  guardarConfiguracionLanding,
  iniciarSesion,
  sesionActual,
  cerrarSesion,
  listarServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  listarVentas,
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
  const [tab, setTab] = useState('landing')
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [login, setLogin] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
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

useEffect(() => {
    async function init() {
      await loadConfig()
    }
    init()
  }, [slug])

  useEffect(() => {
    async function refreshData() {
      if (!user) return
      if (tab === 'servicios') await loadServicios()
      if (tab === 'productos') await loadProductos()
      if (tab === 'ventas') await loadVentas()
    }
    refreshData()
  }, [tab, user])

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
    setServicios([])
    setProductos([])
    setVentas([])
    setTab('landing')
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

  const galleryValue = (form.galeria_urls || []).join('\n')

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
    { key: 'landing', label: 'Landing', icon: 'fa-landmark' },
    { key: 'servicios', label: 'Servicios', icon: 'fa-hand-sparkles' },
    { key: 'productos', label: 'Productos', icon: 'fa-boxes-stacked' },
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
                <label className="admin-checkbox-row">
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
