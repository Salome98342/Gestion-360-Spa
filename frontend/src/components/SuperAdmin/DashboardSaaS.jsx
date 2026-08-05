import './DashboardSaaS.css'

export default function DashboardSaaS() {
    return (
        <div className="dashboard-saas">
            <div className="dashboard-saas-intro">
                <h2 className="dashboard-saas-title">Resumen del negocio</h2>
                <p className="dashboard-saas-copy">Siguiendo los indicadores de nuevos clientes, locales activos, vencimientos y crecimiento del servicio.</p>
            </div>

            <div className="dashboard-metrics">
                <div className="dashboard-card">
                    <div className="dashboard-card-icon dashboard-card-icon-success">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="dashboard-card-info">
                        <p className="dashboard-card-summary">Ingresos mensuales</p>
                        <p className="dashboard-card-value">$1.250.000</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-icon dashboard-card-icon-primary">
                        <i className="fas fa-store"></i>
                    </div>
                    <div className="dashboard-card-info">
                        <p className="dashboard-card-summary">Locales activos</p>
                        <p className="dashboard-card-value">24</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-icon dashboard-card-icon-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="dashboard-card-info">
                        <p className="dashboard-card-summary">Vencimientos próximos</p>
                        <p className="dashboard-card-value dashboard-card-value-warning">3</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-icon dashboard-card-icon-info">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="dashboard-card-info">
                        <p className="dashboard-card-summary">Reservas activas</p>
                        <p className="dashboard-card-value">5.400</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-overview-grid">
                <div className="dashboard-overview-card">
                    <h3>Total de empresas</h3>
                    <p className="dashboard-card-value">42</p>
                </div>
                <div className="dashboard-overview-card">
                    <h3>Planes activos</h3>
                    <p className="dashboard-card-value">31</p>
                </div>
                <div className="dashboard-overview-card">
                    <h3>Renovaciones esta semana</h3>
                    <p className="dashboard-card-value">7</p>
                </div>
            </div>

            <div className="dashboard-graph-placeholder">
                <p><i className="fas fa-chart-bar"></i> Gráfico de crecimiento de suscripciones (próximamente)</p>
            </div>
        </div>
    );
}
