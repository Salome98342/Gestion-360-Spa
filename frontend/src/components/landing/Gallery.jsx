import { resolveImageUrl } from '../../services/api'

export default function Gallery({ urls, onImageClick }) {
  const galleryUrls = (urls || []).filter(Boolean).map(resolveImageUrl)
  
  if (galleryUrls.length === 0) return null

  return (
    <section className="tenant-section">
      <div className="tenant-section-header">
        <div>
          <span className="tenant-eyebrow">Inspiración</span>
          <h2>Galería de trabajo</h2>
        </div>
        <p className="tenant-muted">Mira algunos de nuestros resultados más cuidados.</p>
      </div>
      <div className="tenant-gallery">
        {galleryUrls.map((url, index) => (
<button 
            key={url} 
            type="button" 
            className="tenant-gallery-item" 
            onClick={() => onImageClick(url)}
          >
            <img src={url} alt={`Trabajo ${index + 1}`} />
            <span className="tenant-gallery-overlay" aria-hidden="true">
              <i className="fas fa-search-plus"></i>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
