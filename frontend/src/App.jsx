import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Vistas del SuperAdmin (SaaS)
import SuperAdminLayout from './components/SuperAdmin/SuperAdminLayout';
import DashboardSaaS from './components/SuperAdmin/DashboardSaaS';
import EmpresasManager from './components/SuperAdmin/EmpresasManager';

// Vistas de los Locales (Tenants)
import LandingEmpresa from './pages/LandingEmpresa';
import AgendaEmpresa from './pages/AgendaEmpresa';
import DashboardAdmin from './pages/DashboardAdmin';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ==========================================
            RUTAS DEL SUPER ADMIN (Tu empresa)
            ========================================== */}
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route index element={<DashboardSaaS />} />
          <Route path="empresas" element={<EmpresasManager />} />
        </Route>

        {/* ==========================================
            RUTAS MULTI-TENANT (Para tus clientes/spas)
            El parámetro :slug captura el nombre de la empresa
            ========================================== */}
        
        {/* Landing Page del Spa (Reemplaza index.html) */}
        <Route path="/:slug" element={<LandingEmpresa />} />
        
        {/* Agendador del Spa (Reemplaza agenda.html) */}
        <Route path="/:slug/agenda" element={<AgendaEmpresa />} />
        
        {/* Panel de administración del dueño del Spa (Reemplaza admin.html) */}
        <Route path="/:slug/admin" element={<DashboardAdmin />} />

        {/* Ruta por defecto (Si entran a la raíz de tu dominio) */}
        <Route path="/" element={<Navigate to="/superadmin" />} />
        
      </Routes>
    </Router>
  );
}
