
export default function DashboardSaaS() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Resumen del Negocio</h2>
            
            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Tarjeta de Ingresos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl shrink-0">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Ingresos Mensuales</p>
                        <p className="text-2xl font-bold text-gray-800">$1'250.000</p>
                    </div>
                </div>

                {/* Tarjeta de Locales Activos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xl shrink-0">
                        <i className="fas fa-store"></i>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Locales Activos</p>
                        <p className="text-2xl font-bold text-gray-800">24</p>
                    </div>
                </div>

                {/* Tarjeta de Alertas (Vencimientos) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl shrink-0">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Por Vencer (7 días)</p>
                        <p className="text-2xl font-bold text-gray-800 text-orange-600">3</p>
                    </div>
                </div>

                {/* Tarjeta de Volumen Global */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl shrink-0">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Citas Globales</p>
                        <p className="text-2xl font-bold text-gray-800">+5,400</p>
                    </div>
                </div>
                
            </div>
            
            {/* Aquí a futuro puedes meter una gráfica de crecimiento de clientes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                <p><i className="fas fa-chart-bar mr-2"></i> Gráfico de crecimiento de suscripciones (Próximamente)</p>
            </div>
        </div>
    );
}
