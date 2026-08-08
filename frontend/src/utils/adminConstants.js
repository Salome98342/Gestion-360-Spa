export const initialForm = {
  nombre: '',
  telefono: '',
  whatsapp: '',
  logo_url: '',
  color_primario: '#db2777',
  color_secundario: '#fff0f5',
  color_fondo: '#f8fafc',
  color_superficie: '#ffffff',
  color_texto: '#111827',
  color_texto_boton: '#ffffff',
  titulo_hero: '',
  subtitulo_hero: '',
  imagen_hero_url: '',
  texto_footer: '',
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  galeria_urls: [],
  mostrar_precios: true,
  fuente_titulos: 'Playfair Display',
  fuente_cuerpo: 'Poppins',
  fuente_script: 'Great Vibes',
}

export const emptyServicio = { nombre: '', descripcion: '', precio: '', duracion_minutos: 30, icono: 'fa-hand-sparkles', activo: true, orden: 0 }
export const emptyProducto = { nombre: '', codigo_barras: '', descripcion: '', precio_venta: '', costo: '0', stock_actual: 0 }

export const formatMoney = (value) => Number(value || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
export const colorValido = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback
