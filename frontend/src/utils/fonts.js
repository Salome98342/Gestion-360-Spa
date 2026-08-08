// Fuentes gratuitas de Google Fonts (todas con licencia OFL, libres de uso)
// Se usan para personalizar la tipografía de la landing y la agenda.

export const FONT_CATEGORIES = {
  titles: {
    label: 'Títulos (elegantes y de moda)',
    options: [
      { value: 'Playfair Display', weights: [400, 600, 700, 800] },
      { value: 'Cormorant Garamond', weights: [400, 600, 700] },
      { value: 'Lora', weights: [400, 500, 600, 700] },
      { value: 'Prata', weights: [400] },
      { value: 'Marcellus', weights: [400] },
      { value: 'Cinzel Decorative', weights: [400, 700] },
      { value: 'Josefin Sans', weights: [300, 400, 600, 700] },
    ],
  },
  script: {
    label: 'Caligráfica / Script',
    options: [
      { value: 'Great Vibes', weights: [400] },
      { value: 'Parisienne', weights: [400] },
      { value: 'Dancing Script', weights: [400, 600, 700] },
      { value: 'Pacifico', weights: [400] },
      { value: 'Alex Brush', weights: [400] },
      { value: 'Allura', weights: [400] },
    ],
  },
  body: {
    label: 'Cuerpo / Texto',
    options: [
      { value: 'Poppins', weights: [300, 400, 500, 600, 700] },
      { value: 'Montserrat', weights: [300, 400, 500, 600, 700] },
      { value: 'Lato', weights: [300, 400, 700] },
      { value: 'Quicksand', weights: [400, 500, 600, 700] },
      { value: 'Jost', weights: [300, 400, 500, 600] },
      { value: 'Nunito', weights: [300, 400, 600, 700] },
      { value: 'Raleway', weights: [300, 400, 500, 600, 700] },
    ],
  },
}

// Aplanar todas las fuentes para selección rápida / validación
export const ALL_FONT_VALUES = Object.values(FONT_CATEGORIES)
  .flatMap((c) => c.options)
  .map((o) => o.value)

export const DEFAULT_FONTS = {
  fuente_titulos: 'Playfair Display',
  fuente_cuerpo: 'Poppins',
  fuente_script: 'Great Vibes',
}

// Convierte nombre de fuente a un token seguro para la URL de Google Fonts
// Ej: "Playfair Display" -> "Playfair+Display"
function toGoogleToken(name) {
  return (name || '').trim().replace(/\s+/g, '+')
}

// Construye la URL de Google Fonts para una familia (con sus pesos)
function familyUrl(name) {
  const familia = (FONT_CATEGORIES.titles.options
    .concat(FONT_CATEGORIES.script.options, FONT_CATEGORIES.body.options))
    .find((o) => o.value === name)
  const weights = familia ? familia.weights : [400]
  return `family=${toGoogleToken(name)}:wght@${weights.join(';')}`
}

// Carga dinámicamente el <link> de Google Fonts para las fuentes elegidas.
// Devuelve false si no hace falta (ya cargada o nombre vacío).
export function loadGoogleFonts(fuentes = {}) {
  const nombres = [
    fuentes.fuente_titulos,
    fuentes.fuente_cuerpo,
    fuentes.fuente_script,
  ].filter(Boolean)

  if (nombres.length === 0) return false

  // Evitar duplicar el link si ya está cargado con las mismas familias
  const clave = nombres.slice().sort().join('|')
  const existing = document.querySelector('link[data-fonts-key]')
  if (existing && existing.getAttribute('data-fonts-key') === clave) return false

  const familias = [...new Set(nombres)].map(familyUrl).join('&')
  const href = `https://fonts.googleapis.com/css2?${familias}&display=swap`

  if (existing) {
    existing.setAttribute('data-fonts-key', clave)
    existing.setAttribute('href', href)
  } else {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.setAttribute('data-fonts-key', clave)
    document.head.appendChild(link)
  }
  return true
}
