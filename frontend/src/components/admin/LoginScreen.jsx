import { Link } from 'react-router-dom'

const WHATSAPP_NUMERO = '573187752351'

const MENSAJE_REACTIVAR = 'Hola, soy el dueño de mi negocio. Mi servicio está vencido y quiero reactivarlo. ¿Me pueden ayudar, por favor?'
const MENSAJE_SOPORTE = 'Hola, necesito contactar con soporte porque mi servicio está vencido. ¿Me pueden ayudar, por favor?'

export default function LoginScreen({ slug, login, setLogin, authenticate, error, servicioVencido, setServicioVencido }) {
  return (
    <main className="admin-page">
      <form className="admin-card login-card" onSubmit={authenticate}>
        <h1>Panel del negocio</h1>
        <p className="tenant-muted">Ingresa con tu usuario de dueño para administrar tu negocio.</p>
        {error && <div className="notice error">{error}</div>}

        <div className="settings-grid">
          <label className="full">
            Usuario
            <input
              value={login.username}
              onChange={(e) => setLogin({ ...login, username: e.target.value })}
              required
            />
          </label>
          <label className="full">
            Contraseña
            <input
              type="password"
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
              required
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="tenant-button" type="submit">Entrar</button>
          <Link to={`/${slug}`} className="tenant-button secondary">Volver al sitio</Link>
        </div>
      </form>

      {servicioVencido && (
        <div className="service-expired-overlay" onClick={() => setServicioVencido(false)}>
          <div className="service-expired-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="service-expired-close"
              onClick={() => setServicioVencido(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="service-expired-icon">
              <i className="fas fa-triangle-exclamation"></i>
            </div>
            <h2>Tu servicio está vencido</h2>
            <p className="service-expired-text">
              Parece que no recibimos el pago de tu servicio. Si deseas reactivarlo o
              contactar a soporte, contáctanos con nosotros.
            </p>
            <div className="service-expired-actions">
              <a
                href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAJE_REACTIVAR)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="service-expired-wa reactivar"
                onClick={() => setServicioVencido(false)}
              >
                <i className="fab fa-whatsapp"></i>
                Reactivar mi servicio
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAJE_SOPORTE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="service-expired-wa soporte"
                onClick={() => setServicioVencido(false)}
              >
                <i className="fab fa-whatsapp"></i>
                Contactar a soporte
              </a>
            </div>
            <button
              type="button"
              className="service-expired-ok"
              onClick={() => setServicioVencido(false)}
            >
              Entendido, volver
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
