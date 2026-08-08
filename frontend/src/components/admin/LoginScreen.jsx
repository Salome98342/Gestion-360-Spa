import { Link } from 'react-router-dom'

export default function LoginScreen({ slug, login, setLogin, authenticate, error }) {
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
    </main>
  )
}
