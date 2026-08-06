
import './LicenciaModal.css'

export default function LicenciaModal({
    isOpen,
    onClose,
    form,
    plans,
    onChange,
    onSubmit,
    isSubmitting,
    error,
}) {
    if (!isOpen) return null;

    return (
        <div className="licencia-modal-overlay">
            <div className="licencia-modal-dialog">
                <div className="licencia-modal-header">
                    <div className="licencia-modal-title">
                        <i className="fas fa-id-card licencia-icon"></i>
                        Nuevo negocio
                    </div>
                    <button onClick={onClose} className="licencia-modal-close">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="licencia-modal-body">
                    {error && <div className="notice error modal-notice">{error}</div>}
                    <form className="licencia-modal-form" onSubmit={onSubmit}>
                        <div className="licencia-modal-group">
                            <label>Nombre del Local</label>
                            <input
                                name="nombre"
                                value={form.nombre}
                                onChange={onChange}
                                type="text"
                                placeholder="Ej: Glow Spa Centro"
                                required
                                className="licencia-modal-field"
                            />
                        </div>

                        <div className="licencia-modal-group">
                            <label>Slug (Ruta del sistema)</label>
                            <div className="licencia-modal-group">
                                <span className="licencia-modal-prefix">tudominio.com/</span>
                                <input
                                    name="slug"
                                    value={form.slug}
                                    onChange={onChange}
                                    type="text"
                                    placeholder="glow-centro"
                                    required
                                    className="licencia-modal-field"
                                />
                            </div>
                            <p className="licencia-modal-info">Esta será la URL que el local le dará a sus clientes.</p>
                        </div>

                        <div className="licencia-modal-grid">
                            <div className="licencia-modal-group">
                                <label>Tipo de Plan</label>
                                <select
                                    name="plan_id"
                                    value={form.plan_id}
                                    onChange={onChange}
                                    className="licencia-modal-select"
                                >
                                    <option value="">Sin plan / Plan predeterminado</option>
                                    {plans.length > 0 ? (
                                        plans.map((plan) => {
                                            const dur = Number(plan.duracion_meses) > 0
                                                ? `${plan.duracion_meses} ${plan.duracion_meses === 1 ? 'mes' : 'meses'}`
                                                : Number(plan.duracion_dias) > 0 ? `${plan.duracion_dias} días` : ''
                                            return (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.nombre}{plan.precio_mensual ? ` - ${plan.precio_mensual}` : ''}{dur ? ` (${dur})` : ''}
                                                </option>
                                            )
                                        })
                                    ) : (
                                        <option value="">No se encontraron planes</option>
                                    )}
                                </select>
                            </div>
                            <div className="licencia-modal-group">
                                <label>Vencimiento</label>
                                <input
                                    name="fecha_vencimiento"
                                    value={form.fecha_vencimiento}
                                    onChange={onChange}
                                    type="date"
                                    required
                                    className="licencia-modal-field"
                                />
                                <p className="licencia-modal-info">Se calcula automáticamente según el plan elegido.</p>
                            </div>
                        </div>

                        <div className="account-form-section">
                            <div><p className="account-form-title"><i className="fas fa-user-shield"></i> Cuenta de la propietaria</p><p className="licencia-modal-info">Recibirá acceso al panel de este negocio.</p></div>
                            <div className="licencia-modal-grid">
                                <div className="licencia-modal-group"><label>Nombre</label><input name="admin_nombre" value={form.admin_nombre} onChange={onChange} className="licencia-modal-field" placeholder="Nombre de la dueña" /></div>
                                <div className="licencia-modal-group"><label>Correo</label><input name="admin_email" value={form.admin_email} onChange={onChange} type="email" className="licencia-modal-field" placeholder="correo@negocio.com" /></div>
                                <div className="licencia-modal-group"><label>Usuario</label><input name="admin_username" value={form.admin_username} onChange={onChange} required className="licencia-modal-field" placeholder="ej. glowcentro" /></div>
                                <div className="licencia-modal-group"><label>Contraseña</label><input name="admin_password" value={form.admin_password} onChange={onChange} type="password" minLength="8" required className="licencia-modal-field" placeholder="Mínimo 8 caracteres" /></div>
                            </div>
                        </div>

                        <div className="licencia-modal-actions">
                            <button type="button" onClick={onClose}
                                className="licencia-modal-button cancel">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSubmitting}
                                className="licencia-modal-button submit"
                            >
                                {isSubmitting ? 'Creando...' : 'Crear negocio y acceso'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
