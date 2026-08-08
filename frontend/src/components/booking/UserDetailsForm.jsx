export default function UserDetailsForm({ form, update, fieldErrors }) {
  return (
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
  )
}
