export default function Footer({ empresa, landing }) {
  return (
<footer id="contacto" className="tenant-footer">
      <div>
        <p className="tenant-footer-label"><i className="fas fa-spa"></i> Contáctanos</p>
        <strong>{empresa.nombre}</strong>
        <p>{landing.texto_footer || 'Reserva tu espacio y vive una experiencia de belleza renovada.'}</p>
      </div>
      <div className="tenant-footer-info">
        {empresa.telefono && <p><span>Teléfono:</span> {empresa.telefono}</p>}
        {empresa.whatsapp && <p><span>WhatsApp:</span> {empresa.whatsapp}</p>}
        {empresa.direccion && <p><span>Dirección:</span> {empresa.direccion}</p>}
        
        <div className="tenant-socials">
          {landing.instagram_url && (
            <a href={landing.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          )}
          {landing.facebook_url && (
            <a href={landing.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
          )}
          {landing.tiktok_url && (
            <a href={landing.tiktok_url} target="_blank" rel="noreferrer" aria-label="TikTok">
              <i className="fab fa-tiktok"></i>
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
