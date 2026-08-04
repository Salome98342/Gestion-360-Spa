
export default function LicenciaModal({ isOpen, onClose }) {
    // Si isOpen es falso, no renderizamos nada
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-[fadeIn_0.3s_ease-out]">
                
                {/* Cabecera del Modal */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">
                        <i className="fas fa-id-card text-pink-500 mr-2"></i>
                        Gestionar Licencia
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                {/* Cuerpo del Formulario */}
                <div className="p-6">
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); /* Lógica POST a Django */ }}>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del Local</label>
                            <input type="text" placeholder="Ej: Glow Spa Centro" required 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Slug (Ruta del sistema)</label>
                            <div className="flex items-center shadow-sm">
                                <span className="bg-gray-100 border border-gray-200 border-r-0 rounded-l-xl px-4 py-3 text-gray-500 text-sm">
                                    tudominio.com/
                                </span>
                                <input type="text" placeholder="glow-centro" required 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Esta será la URL que el local le dará a sus clientes.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Plan</label>
                                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all cursor-pointer">
                                    <option value="basico">Básico</option>
                                    <option value="premium">Premium</option>
                                    <option value="prueba">Prueba (14 días)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Vencimiento</label>
                                <input type="date" required 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all" />
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="pt-4 flex gap-3 mt-4">
                            <button type="button" onClick={onClose} 
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all">
                                Cancelar
                            </button>
                            <button type="submit" 
                                className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-all shadow-md">
                                Generar Licencia
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
