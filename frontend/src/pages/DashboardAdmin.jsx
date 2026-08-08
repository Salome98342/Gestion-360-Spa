import { Link, useParams } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'
import LoginScreen from '../components/admin/LoginScreen'
import TabResumen from '../components/admin/TabResumen'
import TabLanding from '../components/admin/TabLanding'
import TabServicios from '../components/admin/TabServicios'
import TabProductos from '../components/admin/TabProductos'
import TabCitas from '../components/admin/TabCitas'
import './DashboardAdmin.css'

export default function DashboardAdmin() {
  const { slug } = useParams()
  const {
    tab, setTab, user, login, setLogin, error, message, saving, uploading, loading, form, updateForm,
    authenticate, logout, saveConfig, uploadImage, removeGalleryImage, confirmarPorWhatsApp,
    servicios, servicioForm, updateServicio, startEditServicio, resetServicioForm, submitServicio, removeServicio, editingServicioId, servicioError, servicioSaving,
    productos, productoForm, updateProducto, submitProducto, productoError, productoSaving,
    citas, citasError, loadCitas
  } = useAdmin(slug)

  if (loading && !user) {
    return (
      <main className="admin-page">
        <div className="admin-card login-card">
          <h1>Cargando panel...</h1>
        </div>
      </main>
    )
  }

  if (!user) {
    return <LoginScreen slug={slug} login={login} setLogin={setLogin} authenticate={authenticate} error={error} />
  }

  const tabs = [
    { key: 'resumen', label: 'Resumen', icon: 'fa-chart-pie' },
    { key: 'landing', label: 'Mi landing', icon: 'fa-wand-magic-sparkles' },
    { key: 'citas', label: 'Reservas', icon: 'fa-calendar-check' },
    { key: 'servicios', label: 'Servicios', icon: 'fa-hand-sparkles' },
  ]

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-head">
          <div className="admin-head-grid">
            <div>
              <Link to={`/${user.empresa_slug || slug}`} className="admin-back-link">← Ver landing</Link>
              <h1 className="admin-page-title">Panel del negocio</h1>
              <p className="tenant-muted">Administrando {user.empresa_nombre}.</p>
            </div>
            <button type="button" onClick={logout} className="tenant-button secondary">
              Cerrar sesión
            </button>
          </div>

          <nav className="admin-tabs">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`admin-tab ${tab === item.key ? 'active' : ''}`}
                onClick={() => setTab(item.key)}
              >
                <i className={`fas ${item.icon} admin-tab-icon`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        {tab === 'resumen' && (
          <TabResumen servicios={servicios} productos={productos} form={form} setTab={setTab} />
        )}

        {tab === 'landing' && (
          <TabLanding 
            form={form} updateForm={updateForm} saveConfig={saveConfig} 
            uploadImage={uploadImage} removeGalleryImage={removeGalleryImage}
            error={error} message={message} saving={saving} uploading={uploading} 
            slug={slug} user={user} 
          />
        )}

        {tab === 'servicios' && (
          <TabServicios 
            servicios={servicios} servicioForm={servicioForm} updateServicio={updateServicio} 
            submitServicio={submitServicio} startEditServicio={startEditServicio} 
            resetServicioForm={resetServicioForm} removeServicio={removeServicio} 
            editingServicioId={editingServicioId} servicioError={servicioError} 
            servicioSaving={servicioSaving} 
          />
        )}

        {tab === 'productos' && (
          <TabProductos 
            productos={productos} productoForm={productoForm} updateProducto={updateProducto} 
            submitProducto={submitProducto} productoError={productoError} 
            productoSaving={productoSaving} 
          />
        )}

        {tab === 'citas' && (
          <TabCitas 
            citas={citas} citasError={citasError} loadCitas={loadCitas} 
            confirmarPorWhatsApp={confirmarPorWhatsApp} 
          />
        )}
      </div>
    </main>
  )
}
