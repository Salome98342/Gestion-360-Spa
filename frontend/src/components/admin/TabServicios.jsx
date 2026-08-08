import { formatMoney } from '../../utils/adminConstants'

export default function TabServicios({ 
  servicios, servicioForm, updateServicio, submitServicio, 
  startEditServicio, resetServicioForm, removeServicio, 
  editingServicioId, servicioError, servicioSaving 
}) {
  return (
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
          <label className="full">Nombre<input name="nombre" value={servicioForm.nombre} onChange={updateServicio} required /></label>
          <label className="full">Descripción<textarea name="descripcion" value={servicioForm.descripcion} onChange={updateServicio} /></label>
          <label>Precio (COP)<input name="precio" type="number" step="0.01" min="0" value={servicioForm.precio} onChange={updateServicio} required /></label>
          <label>Duración (minutos)<input name="duracion_minutos" type="number" min="1" value={servicioForm.duracion_minutos} onChange={updateServicio} required /></label>
          <label>Orden<input name="orden" type="number" value={servicioForm.orden} onChange={updateServicio} /></label>
          <label>Ícono (FontAwesome)<input name="icono" value={servicioForm.icono} onChange={updateServicio} /></label>
          <label className="admin-checkbox-row"><input name="activo" type="checkbox" checked={servicioForm.activo} onChange={updateServicio} /> Activo</label>
        </div>
        <div className="form-actions">
          <button className="tenant-button" type="submit" disabled={servicioSaving}>
            {servicioSaving ? 'Guardando...' : (editingServicioId ? 'Guardar cambios' : 'Agregar servicio')}
          </button>
          {editingServicioId && (
            <button className="tenant-button secondary" type="button" onClick={resetServicioForm}>Cancelar</button>
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
  )
}
