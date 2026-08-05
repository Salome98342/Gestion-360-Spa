
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
                        Gestionar Licencia
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
                                        plans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.nombre} {plan.precio_mensual ? `- ${plan.precio_mensual}` : ''}
                                            </option>
                                        ))
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
                                {isSubmitting ? 'Generando...' : 'Generar Licencia'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
