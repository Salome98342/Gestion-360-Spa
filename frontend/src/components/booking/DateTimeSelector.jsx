export default function DateTimeSelector({ form, update, setFieldValue, fieldErrors, availableTimes, loadingTimes }) {
  return (
    <section className="booking-section">
      <div className="booking-section-header">
        <div>
          <h2>2. Elige fecha y hora</h2>
          <p>Disponibilidad pensada para que reserves sin complicaciones.</p>
        </div>
      </div>

      <div className="booking-grid compact">
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
          {availableTimes.map((time) => (
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
        {loadingTimes && <p className="tenant-muted">Consultando horarios disponibles...</p>}
        {!loadingTimes && form.fecha && form.servicio_id && availableTimes.length === 0 && <p className="tenant-muted">No quedan horarios disponibles para esta fecha.</p>}
        {fieldErrors.hora && <p className="field-error">{fieldErrors.hora}</p>}
      </div>
    </section>
  )
}
