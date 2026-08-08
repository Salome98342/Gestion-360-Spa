export default function Lightbox({ image, onClose }) {
  if (!image) return null

  return (
    <button className="lightbox" onClick={onClose} aria-label="Cerrar vista ampliada">
      <img src={image} alt="Vista ampliada" />
    </button>
  )
}
