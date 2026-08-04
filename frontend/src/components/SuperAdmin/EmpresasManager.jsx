import { useState } from 'react';
import LicenciaModal from './LicenciaModal'; // Asegúrate de tener este componente en la misma ruta

export default function EmpresasManager() {
    // Estado para controlar si el modal de licencias está visible o no
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado simulado (luego esto vendrá de un GET a tu API en Django)
    const [empresas] = useState([
        { id: 1, nombre: 'Glow Spa Centro', slug: 'glow-centro', plan: 'Premium', estadoLicencia: 'Activa', vence: '2026-12-01' },
        { id: 2, nombre: 'Uñas Express', slug: 'unas-express', plan: 'Básico', estadoLicencia: 'Vencida', vence: '2026-07-20' },
    ]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
            
            {/* Cabecera de la tabla */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    <i className="fas fa-store text-pink-500 mr-2"></i>
                    Locales y Licencias Activas
                </h3>
                
                {/* Botón que dispara el cambio de estado para abrir el modal */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <i className="fas fa-plus"></i> Nueva Empresa
                </button>
            </div>

            {/* Tabla de empresas */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm border-y border-gray-100">
                            <th className="p-4">Empresa / URL</th>
                            <th className="p-4">Plan</th>
                            <th className="p-4">Vencimiento</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {empresas.map(empresa => (
                            <tr key={empresa.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{empresa.nombre}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">/app/{empresa.slug}</div>
                                </td>
                                <td className="p-4 font-medium text-gray-700">{empresa.plan}</td>
                                <td className="p-4 text-gray-600">{empresa.vence}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        empresa.estadoLicencia === 'Activa' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                        {empresa.estadoLicencia}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Renovar Licencia">
                                            <i className="fas fa-sync-alt"></i>
                                        </button>
                                        <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Suspender Servicio">
                                            <i className="fas fa-ban"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Renderizado del Modal. Le pasamos el estado y la función para cerrarlo como props */}
            <LicenciaModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
            
        </div>
    );
}
