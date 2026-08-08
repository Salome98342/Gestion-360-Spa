import { colorValido } from '../../utils/adminConstants'

export default function ColorControl({ name, label, value, onChange, fallback }) {
  const color = colorValido(value, fallback)
  return (
    <label className="brand-color-control">
      <span>{label}</span>
      <span className="brand-color-inputs">
        <input className="brand-color-swatch" name={name} type="color" value={color} onChange={onChange} aria-label={`Elegir ${label.toLowerCase()}`} />
        <input className="brand-color-code" name={name} value={value || color} onChange={onChange} maxLength="7" placeholder="#000000" aria-label={`Código hexadecimal de ${label.toLowerCase()}`} />
      </span>
    </label>
  )
}
