import { useState, useEffect, useMemo } from 'react'
import imageCompression from 'browser-image-compression'
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
  listarCitasEmpresa,
  listarProductos,
  crearProducto,
} from '../services/api'
import { initialForm, emptyServicio, emptyProducto } from '../utils/adminConstants'

export function useAdmin(slug) {
  const [tab, setTab] = useState('resumen')
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [login, setLogin] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [loading, setLoading] = useState(true)

  // Servicios
  const [servicios, setServicios] = useState([])
  const [servicioForm, setServicioForm] = useState(emptyServicio)
  const [editingServicioId, setEditingServicioId] = useState(null)
  const [servicioError, setServicioError] = useState('')
  const [servicioSaving, setServicioSaving] = useState(false)

  // Productos
  const [productos, setProductos] = useState([])
  const [productoForm, setProductoForm] = useState(emptyProducto)
  const [productoError, setProductoError] = useState('')
  const [productoSaving, setProductoSaving] = useState(false)

  // Citas
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
    loadConfig()
  }, [slug])

  useEffect(() => {
    if (!user) return
    Promise.all([loadServicios(), loadCitas()])
  }, [user])

  useEffect(() => {
    if (!user) return
    if (tab === 'servicios') loadServicios()
    if (tab === 'citas') loadCitas()
  }, [tab])

  const updateForm = (event) => {
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

  function confirmarPorWhatsApp(cita) {
    if (!form.whatsapp?.trim()) {
      setCitasError('Configura el número de WhatsApp de tu negocio en “Mi landing” antes de enviar confirmaciones.')
      return
    }
    let telefono = String(cita.telefono || '').replace(/\D/g, '')
    if (telefono.length === 10 && telefono.startsWith('3')) telefono = `57${telefono}`
    if (telefono.length < 10) {
      setCitasError('La reserva no tiene un número de WhatsApp válido.')
      return
    }
    const fecha = new Date(`${cita.fecha}T00:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
    const mensaje = `Hola ${cita.cliente}. Te escribimos de ${form.nombre} para confirmar tu cita.\n\nServicio: ${cita.servicio}\nFecha: ${fecha}\nHora: ${cita.hora}\nDirección: ${form.direccion || 'la dirección registrada del negocio'}\n\n¡Te esperamos!`
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer')
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
    const coloresMarca = ['color_primario', 'color_secundario', 'color_fondo', 'color_superficie', 'color_texto', 'color_texto_boton']
    if (coloresMarca.some((campo) => !/^#[0-9a-f]{6}$/i.test(form[campo] || ''))) {
      setError('Usa un color hexadecimal válido, por ejemplo #DB2777.')
      return
    }
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
    try { await cerrarSesion() } catch {}
    setUser(null)
    setForm(initialForm)
    setServicios([])
    setProductos([])
    setTab('resumen')
  }

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

  return {
    tab, setTab, user, login, setLogin, error, message, saving, uploading, loading, form, updateForm,
    authenticate, logout, saveConfig, uploadImage, removeGalleryImage, confirmarPorWhatsApp,
    servicios, servicioForm, updateServicio, startEditServicio, resetServicioForm, submitServicio, removeServicio, editingServicioId, servicioError, servicioSaving,
    productos, productoForm, updateProducto, resetProductoForm, submitProducto, productoError, productoSaving,
    citas, citasError, loadCitas
  }
}
