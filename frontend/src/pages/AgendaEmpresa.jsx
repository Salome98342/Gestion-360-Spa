import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { landingPublico, reservarCita } from '../services/api'
import './AgendaEmpresa.css'

const hours = Array.from(
  { length: 18 },
  (_, index) => `${String(9 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`
)

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value || 0))

const formatDateLabel = (value) => {
  if (!value) return 'Elige una fecha'
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function AgendaEmpresa() {
  const { slug } = useParams()
  const [landing, setLanding] = useState(null)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState({
    servicio_id: '',
    sucursal_id: '',
    fecha: '',
    hora: '',
    nombre: '',
    telefono: '',
    email: '',
    notas: '',
  })

  useEffect(() => {
    landingPublico(slug)
      .then((data) => {
        setLanding(data)
        if (data.sucursales.length === 1) {
          setForm((current) => ({
            ...current,
            sucursal_id: String(data.sucursales[0].id),
          }))
        }
      })
      .catch((err) => setError(err.message))
  }, [slug])

  const services = useMemo(() => {
    if (!landing) return []
    return landing.servicios.filter(
      (item) => !item.sucursal_id || String(item.sucursal_id) === form.sucursal_id
    )
  }, [landing, form.sucursal_id])

  const selectedService = useMemo(
    () => services.find((item) => String(item.id) === String(form.servicio_id)) || null,
    [services, form.servicio_id]
  )

  const selectedSucursal = useMemo(
    () => landing?.sucursales.find((item) => String(item.id) === String(form.sucursal_id)) || null,
    [landing, form.sucursal_id]
  )

  const step = useMemo(() => {
    if (!form.servicio_id) return 1
    if (!form.fecha || !form.hora) return 2
    return 3
  }, [form.fecha, form.hora, form.servicio_id])

  const isFormValid = Boolean(
    form.sucursal_id &&
      form.servicio_id &&
      form.fecha &&
      form.hora &&
      form.nombre.trim() &&
      form.telefono.trim()
  )

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'sucursal_id' ? { servicio_id: '' } : {}),
    }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setError('')
  }

  const setFieldValue = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setError('')
  }

  function validateForm() {
    const nextErrors = {}
    if (!form.sucursal_id) nextErrors.sucursal_id = 'Selecciona una sucursal'
    if (!form.servicio_id) nextErrors.servicio_id = 'Elige un servicio'
    if (!form.fecha) nextErrors.fecha = 'Selecciona una fecha'
    if (!form.hora) nextErrors.hora = 'Elige una hora'
    if (!form.nombre.trim()) nextErrors.nombre = 'Escribe tu nombre'
    if (!form.telefono.trim()) nextErrors.telefono = 'Ingresa tu teléfono'

    setFieldErrors(nextErrors)
    return nextErrors
  }

  async function submit(event) {
    event.preventDefault()
    const nextErrors = validateForm()
    if (Object.keys(nextErrors).length > 0) {
      setError('Completa los campos obligatorios para reservar tu cita.')
      return
    }

    setError('')
    setSending(true)

    try {
      const cita = await reservarCita(slug, {
        ...form,
        servicio_id: Number(form.servicio_id),
        sucursal_id: Number(form.sucursal_id),
      })
      setSuccess(cita.cita)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (!landing) {
    return (
      <main className="tenant-state">
        <div className="spinner"></div>
        <p>{error || 'Cargando agenda…'}</p>
      </main>
    )
  }

  if (success) {
    return (
      <main className="tenant-state success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1>¡Tu cita fue reservada!</h1>
        <div className="success-details">
          <p><strong>Servicio:</strong> {success.servicio}</p>
          <p><strong>Sucursal:</strong> {success.sucursal}</p>
          <p><strong>Fecha y hora:</strong> {success.fecha} a las {success.hora}</p>
        </div>
        <Link className="tenant-button" to={`/${slug}`}>Volver al inicio</Link>
      </main>
    )
  }

  return (
    <main className="booking-page">
      <Link className="back-link" to={`/${slug}`}>
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver a {landing.empresa.nombre}
      </Link>

      <div className="booking-card">
        <div className="booking-header">
          <div className="booking-headline">
            <div>
              <p className="booking-eyebrow">Reserva tu momento ideal</p>
              <h1>Agenda tu cita</h1>
            </div>
            <div className="booking-stepper" aria-label="Progreso del formulario">
              <span className={`booking-step ${step >= 1 ? 'active' : ''}`}>1. Servicio</span>
              <span className={`booking-step ${step >= 2 ? 'active' : ''}`}>2. Fecha y hora</span>
              <span className={`booking-step ${step >= 3 ? 'active' : ''}`}>3. Tus datos</span>
            </div>
          </div>
          <p className="tenant-muted">Completa tus datos para confirmar la reserva en pocos minutos y con una experiencia mucho más clara.</p>
        </div>

        {error && <div className="notice error">{error}</div>}

        <div className="booking-layout">
          <form onSubmit={submit} className="booking-form">
            <section className="booking-section">
              <div className="booking-section-header">
                <div>
                  <h2>1. Elige tu servicio</h2>
                  <p>Selecciona la experiencia que quieres vivir hoy.</p>
                </div>
                <span className="booking-badge">{services.length} opciones</span>
              </div>

              <div className="service-grid">
                {services.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`service-option ${String(item.id) === String(form.servicio_id) ? 'selected' : ''}`}
                    onClick={() => setFieldValue('servicio_id', String(item.id))}
                  >
                    <div className="service-option-icon">
                      <i className={`fas ${item.icono || 'fa-spa'}`}></i>
                    </div>
                    <div className="service-option-body">
                      <strong>{item.nombre}</strong>
                      <p>{item.descripcion || 'Servicio pensado para tu comodidad y bienestar.'}</p>
                      <span>{item.duracion_minutos} min · {formatCurrency(item.precio)}</span>
                    </div>
                  </button>
                ))}
              </div>
              {fieldErrors.servicio_id && <p className="field-error">{fieldErrors.servicio_id}</p>}
            </section>

            <section className="booking-section">
              <div className="booking-section-header">
                <div>
                  <h2>2. Elige fecha y hora</h2>
                  <p>Disponibilidad pensada para que reserves sin complicaciones.</p>
                </div>
              </div>

              <div className="booking-grid compact">
                <label>
                  <span>Sucursal</span>
                  <select
                    name="sucursal_id"
                    value={form.sucursal_id}
                    onChange={update}
                    required
                  >
                    <option value="">Selecciona</option>
                    {landing.sucursales.map((item) => (
                      <option key={item.id} value={item.id}>{item.nombre}</option>
                    ))}
                  </select>
                  {fieldErrors.sucursal_id && <p className="field-error">{fieldErrors.sucursal_id}</p>}
                </label>

                <label>
                  <span>Fecha</span>
                  <input
                    name="fecha"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.fecha}
                    onChange={update}
                    required
                  />
                  {fieldErrors.fecha && <p className="field-error">{fieldErrors.fecha}</p>}
                </label>
              </div>

              <div className="time-section">
                <p className="time-section-title">Horario disponible</p>
                <div className="time-options">
                  {hours.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`time-option ${form.hora === time ? 'selected' : ''}`}
                      onClick={() => setFieldValue('hora', time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {fieldErrors.hora && <p className="field-error">{fieldErrors.hora}</p>}
              </div>
            </section>

            <section className="booking-section">
              <div className="booking-section-header">
                <div>
                  <h2>3. Tus datos</h2>
                  <p>Solo necesitamos la información básica para preparar tu experiencia.</p>
                </div>
              </div>

              <div className="booking-grid compact">
                <label>
                  <span>Nombre completo</span>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={update}
                    required
                    placeholder="Ej. Juan Pérez"
                  />
                  {fieldErrors.nombre && <p className="field-error">{fieldErrors.nombre}</p>}
                </label>

                <label>
                  <span>Teléfono</span>
                  <input
                    name="telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={update}
                    required
                    placeholder="Ej. +57 300 000 0000"
                  />
                  {fieldErrors.telefono && <p className="field-error">{fieldErrors.telefono}</p>}
                </label>

                <label className="full">
                  <span>Correo electrónico (opcional)</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={update}
                    placeholder="ejemplo@correo.com"
                  />
                </label>

                <label className="full">
                  <span>Notas (opcional)</span>
                  <textarea
                    name="notas"
                    value={form.notas}
                    onChange={update}
                    placeholder="Añade detalles para que la experiencia sea aún mejor."
                    rows="3"
                  />
                </label>
              </div>
            </section>

            <div className="form-actions">
              <button className="tenant-button" disabled={sending || !isFormValid}>
                {sending ? 'Reservando…' : 'Confirmar reserva'}
              </button>
            </div>
          </form>

          <aside className="booking-summary-card">
            <div className="summary-chip">Resumen</div>
            <h3>{selectedService ? selectedService.nombre : 'Tu próximo tratamiento'}</h3>
            <p>{selectedService ? selectedService.descripcion || 'Servicio seleccionado para tu bienestar.' : 'Elige un servicio para ver el detalle aquí.'}</p>

            <div className="summary-list">
              <div className="summary-item">
                <span>Sucursal</span>
                <strong>{selectedSucursal ? selectedSucursal.nombre : 'Por escoger'}</strong>
              </div>
              <div className="summary-item">
                <span>Fecha</span>
                <strong>{formatDateLabel(form.fecha)}</strong>
              </div>
              <div className="summary-item">
                <span>Hora</span>
                <strong>{form.hora || 'Por escoger'}</strong>
              </div>
              <div className="summary-item highlight">
                <span>Precio estimado</span>
                <strong>{selectedService ? formatCurrency(selectedService.precio) : '—'}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}