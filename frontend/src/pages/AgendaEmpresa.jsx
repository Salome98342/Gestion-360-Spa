import { Link, useParams } from 'react-router-dom'
import { useBooking } from '../hooks/useBooking'
import SuccessScreen from '../components/booking/SuccessScreen'
import ServiceSelector from '../components/booking/ServiceSelector'
import DateTimeSelector from '../components/booking/DateTimeSelector'
import UserDetailsForm from '../components/booking/UserDetailsForm'
import BookingSummary from '../components/booking/BookingSummary'
import './AgendaEmpresa.css'

export default function AgendaEmpresa() {
  const { slug } = useParams()
  const {
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
    submit
  } = useBooking(slug)

  if (!landing) {
    return (
      <main className="tenant-state">
        <div className="spinner"></div>
        <p>{error || 'Cargando agenda…'}</p>
      </main>
    )
  }

  if (success) {
    return <SuccessScreen success={success} slug={slug} />
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
            <ServiceSelector 
              services={services} 
              form={form} 
              setFieldValue={setFieldValue} 
              fieldErrors={fieldErrors} 
            />
            
            <DateTimeSelector 
              form={form} 
              update={update} 
              setFieldValue={setFieldValue} 
              fieldErrors={fieldErrors} 
              availableTimes={availableTimes} 
              loadingTimes={loadingTimes} 
            />
            
            <UserDetailsForm 
              form={form} 
              update={update} 
              fieldErrors={fieldErrors} 
            />

            <div className="form-actions">
              <button className="tenant-button" disabled={sending || !isFormValid}>
                {sending ? 'Reservando…' : 'Confirmar reserva'}
              </button>
            </div>
          </form>

          <BookingSummary 
            landing={landing} 
            form={form} 
            selectedService={selectedService} 
          />
        </div>
      </div>
    </main>
  )
}
