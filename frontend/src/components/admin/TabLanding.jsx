import { Link } from 'react-router-dom'
import ColorControl from './ColorControl'

export default function TabLanding({ 
  form, updateForm, saveConfig, uploadImage, removeGalleryImage, 
  error, message, saving, uploading, slug, user 
}) {
  const previewTheme = {
    '--preview-primary': form.color_primario || '#db2777',
    '--preview-secondary': form.color_secundario || '#fff0f5',
  }

  return (
    <form className="admin-card" onSubmit={saveConfig}>
      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice">{message}</div>}

      <div className="admin-preview-card" style={previewTheme}>
        <div>
          <p className="admin-preview-label">Vista previa rápida</p>
          <h3>{form.titulo_hero || 'Tu landing lucirá mucho mejor con una portada clara'}</h3>
          <p>{form.subtitulo_hero || 'Haz que cada visita se sienta especial y conviértela en una reserva.'}</p>
        </div>
        <span className="admin-preview-pill">Reserva ahora</span>
      </div>

      <section>
        <h2>Marca y colores</h2>
        <div className="settings-grid">
          <label>Nombre comercial<input name="nombre" value={form.nombre} onChange={updateForm} required /></label>
          <label>Teléfono<input name="telefono" value={form.telefono} onChange={updateForm} /></label>
          <label>WhatsApp<input name="whatsapp" value={form.whatsapp} onChange={updateForm} /></label>
          <label className="image-upload-field">
            Logo
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadImage(event, 'logo_url')} disabled={uploading === 'logo_url'} />
            <small>Se optimiza automáticamente a máximo 1 MB y 1024 px.</small>
            {uploading === 'logo_url' && <span className="image-upload-status">Optimizando y cargando...</span>}
            {form.logo_url && <img className="image-upload-preview logo" src={form.logo_url} alt="Vista previa del logo" />}
          </label>
          <ColorControl name="color_primario" label="Color principal" value={form.color_primario} onChange={updateForm} fallback="#db2777" />
          <ColorControl name="color_secundario" label="Color complementario" value={form.color_secundario} onChange={updateForm} fallback="#fff0f5" />
          <ColorControl name="color_fondo" label="Fondo general" value={form.color_fondo} onChange={updateForm} fallback="#f8fafc" />
          <ColorControl name="color_superficie" label="Tarjetas y navegación" value={form.color_superficie} onChange={updateForm} fallback="#ffffff" />
          <ColorControl name="color_texto" label="Texto principal" value={form.color_texto} onChange={updateForm} fallback="#111827" />
          <ColorControl name="color_texto_boton" label="Texto de botones" value={form.color_texto_boton} onChange={updateForm} fallback="#ffffff" />
        </div>
      </section>

      <section>
        <h2>Portada y contenido</h2>
        <div className="settings-grid">
          <label className="full">Título principal<input name="titulo_hero" value={form.titulo_hero} onChange={updateForm} /></label>
          <label className="full">Subtítulo<textarea name="subtitulo_hero" value={form.subtitulo_hero} onChange={updateForm} /></label>
          <label className="full image-upload-field">
            Imagen de portada
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadImage(event, 'imagen_hero_url')} disabled={uploading === 'imagen_hero_url'} />
            <small>Se optimiza automáticamente antes de subirla.</small>
            {uploading === 'imagen_hero_url' && <span className="image-upload-status">Optimizando y cargando...</span>}
            {form.imagen_hero_url && <img className="image-upload-preview hero" src={form.imagen_hero_url} alt="Vista previa de portada" />}
          </label>
          <label className="full">Texto del footer<textarea name="texto_footer" value={form.texto_footer} onChange={updateForm} /></label>
        </div>
      </section>

      <section>
        <h2>Redes sociales</h2>
        <div className="settings-grid">
          <label>Instagram<input name="instagram_url" value={form.instagram_url} onChange={updateForm} placeholder="https://instagram.com/..." /></label>
          <label>Facebook<input name="facebook_url" value={form.facebook_url} onChange={updateForm} placeholder="https://facebook.com/..." /></label>
          <label>TikTok<input name="tiktok_url" value={form.tiktok_url} onChange={updateForm} placeholder="https://tiktok.com/@..." /></label>
          <label className="admin-checkbox-row">
            <input name="mostrar_precios" type="checkbox" checked={form.mostrar_precios} onChange={updateForm} />
            Mostrar precios en la landing
          </label>
        </div>
      </section>

      <section>
        <h2>Galería</h2>
        <label className="full image-upload-field">
          Imágenes de la galería
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => uploadImage(event, 'galeria_urls', true)} disabled={uploading === 'galeria_urls'} />
          <small>Puedes seleccionar varias imágenes; cada una se comprime antes de cargarse.</small>
          {uploading === 'galeria_urls' && <span className="image-upload-status">Optimizando y cargando imágenes...</span>}
        </label>
        {(form.galeria_urls || []).length > 0 && <div className="gallery-upload-preview">
          {form.galeria_urls.map((url) => <div key={url}><img src={url} alt="Imagen de galería" /><button type="button" onClick={() => removeGalleryImage(url)} aria-label="Quitar imagen">×</button></div>)}
        </div>}
      </section>

      <div className="form-actions">
        <button className="tenant-button" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        <Link to={`/${user.empresa_slug || slug}`} className="tenant-button secondary">Ver landing pública</Link>
      </div>
    </form>
  )
}
