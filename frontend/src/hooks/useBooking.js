import { useEffect, useMemo, useState } from 'react'
import { disponibilidadCitas, landingPublico, reservarCita } from '../services/api' // Ajusta esta ruta según tu proyecto
import { getThemeConfig } from '../utils/landingConstants'
import { loadGoogleFonts } from '../utils/fonts'

export function useBooking(slug) {
  const [landing, setLanding] = useState(null)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [availableTimes, setAvailableTimes] = useState([])
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [success, setSuccess] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState({
    servicio_id: '',
    fecha: '',
    hora: '',
    nombre: '',
    telefono: '',
    email: '',
    notas: '',
  })

  useEffect(() => {
    landingPublico(slug)
      .then((data) => setLanding(data))
      .catch((err) => setError(err.message))
  }, [slug])

  const services = useMemo(() => landing ? landing.servicios : [], [landing])

  const selectedService = useMemo(
    () => services.find((item) => String(item.id) === String(form.servicio_id)) || null,
    [services, form.servicio_id]
  )

  const step = useMemo(() => {
    if (!form.servicio_id) return 1
    if (!form.fecha || !form.hora) return 2
    return 3
  }, [form.fecha, form.hora, form.servicio_id])

  const isFormValid = Boolean(
    form.servicio_id && form.fecha && form.hora && form.nombre.trim() && form.telefono.trim()
  )

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'fecha' ? { hora: '' } : {}),
    }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setError('')
  }

  const setFieldValue = (name, value) => {
    setForm((current) => ({ ...current, [name]: value, ...(name === 'servicio_id' ? { hora: '' } : {}) }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setError('')
  }

  function validateForm() {
    const nextErrors = {}
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
      })
      setSuccess(cita.cita)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

useEffect(() => {
    if (!form.fecha || !form.servicio_id) {
      setAvailableTimes([])
      return
    }
    setLoadingTimes(true)
    disponibilidadCitas(slug, form.fecha, form.servicio_id)
      .then((data) => {
        const horas = data.horas || []
        setAvailableTimes(horas)
        setForm((current) => horas.includes(current.hora) ? current : { ...current, hora: '' })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTimes(false))
  }, [slug, form.fecha, form.servicio_id])

  // Cargar las fuentes elegidas por el negocio (Google Fonts OFL)
  useEffect(() => {
    if (landing) loadGoogleFonts(landing.landing)
  }, [landing])

  const themeConfig = landing ? getThemeConfig(landing.empresa, landing.landing) : {}

  return {
    landing,
    error,
    sending,
    availableTimes,
    loadingTimes,
    success,
    fieldErrors,
    form,
    services,
    selectedService,
    step,
    isFormValid,
    update,
    setFieldValue,
    submit,
    themeConfig
  }
}
