import { DEFAULT_FONTS } from './fonts'

export const HERO_DEFAULT = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1100&q=85'

export const formatMoney = (value) => 
  Number(value || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

export const getThemeConfig = (empresa, landing = {}) => {
  const primary = empresa.color_primario || '#db2777'
  const secondary = empresa.color_secundario || '#fff0f5'
  
  return {
    '--tenant-brand-primary': primary,
    '--tenant-brand-secondary': secondary,
    '--tenant-brand-page': empresa.color_fondo || '#f8fafc',
    '--tenant-brand-surface': empresa.color_superficie || '#ffffff',
    '--tenant-brand-text': empresa.color_texto || '#111827',
    '--tenant-brand-button-text': empresa.color_texto_boton || '#ffffff',
    '--tenant-font-title': landing.fuente_titulos || DEFAULT_FONTS.fuente_titulos,
    '--tenant-font-body': landing.fuente_cuerpo || DEFAULT_FONTS.fuente_cuerpo,
    '--tenant-font-script': landing.fuente_script || DEFAULT_FONTS.fuente_script,
    '--primary': primary,
    '--secondary': secondary,
  }
}
