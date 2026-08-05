import { useEffect, useState } from 'react';
import LicenciaModal from './LicenciaModal';
import { listarEmpresasSuperAdmin, crearEmpresaSuperAdmin, listarPlanesLicencia } from '../../services/api';
import './EmpresasManager.css'

const initialForm = {
    nombre: '',
    slug: '',
    telefono: '',
    whatsapp: '',
    plan_id: '',
    fecha_vencimiento: '',
};

export default function EmpresasManager() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [empresas, setEmpresas] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [empresasData, planesData] = await Promise.all([listarEmpresasSuperAdmin(), listarPlanesLicencia()]);
                setEmpresas(empresasData.empresas || []);
                setPlanes(planesData.planes || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload = {
                ...form,
                telefono: form.telefono || null,
                whatsapp: form.whatsapp || null,
            };
            const response = await crearEmpresaSuperAdmin(payload);
            setEmpresas((current) => [response, ...current]);
            setForm(initialForm);
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const statusLabel = (empresa) => {
        if (empresa.tiene_acceso) return 'Activa';
        return 'Inactiva';
    };

    return (
        <div className="empresas-manager">
            <div className="empresas-header">
                <h3>
                    <i className="fas fa-store empresas-header-icon"></i>
                    Locales y Licencias Activas
                </h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <i className="fas fa-plus"></i> Nueva Empresa
                </button>
            </div>

            {error && <div className="notice error mb-4">{error}</div>}

            <div className="table-wrapper">
                <table className="empresas-table">
                    <thead>
                        <tr>
                            <th>Empresa / URL</th>
                            <th>Plan</th>
                            <th>Vencimiento</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr className="table-empty-row"><td colSpan="5" className="table-empty-cell">Cargando empresas...</td></tr>
                        ) : empresas.length === 0 ? (
                            <tr className="table-empty-row"><td colSpan="5" className="table-empty-cell">No hay empresas registradas.</td></tr>
                        ) : (
                            empresas.map((empresa) => (
                                <tr key={empresa.id} className="table-row-hover">
                                    <td>
                                        <div className="empresas-row-name">{empresa.nombre}<span className="empresa-slug">/{empresa.slug}</span></div>
                                    </td>
                                    <td>{empresa.licencia?.plan || 'Sin plan'}</td>
                                    <td>{empresa.licencia?.fecha_vencimiento || '—'}</td>
                                    <td>
                                        <span className={`status-pill ${empresa.tiene_acceso ? 'active' : 'inactive'}`}>
                                            {statusLabel(empresa)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-button" title="Renovar Licencia">
                                                <i className="fas fa-sync-alt"></i>
                                            </button>
                                            <button className="action-button" title="Suspender Servicio">
                                                <i className="fas fa-ban"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <LicenciaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                form={form}
                plans={planes}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={submitting}
                error={error}
            />
        </div>
    );
}
