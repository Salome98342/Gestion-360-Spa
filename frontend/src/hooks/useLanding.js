import { useState, useEffect } from 'react'
import { landingPublico } from '../services/api' // Ajusta según tu estructura
import { getThemeConfig } from '../utils/landingConstants'
import { loadGoogleFonts } from '../utils/fonts'

export function useLanding(slug) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    let active = true
    
    landingPublico(slug)
      .then((payload) => { 
        if (active) { 
          setData(payload)
          setError('') 
        } 
      })
      .catch((err) => { 
        if (active) setError(err.message) 
      })
      
    return () => { active = false }
  }, [slug])

  // Cargar las fuentes elegidas por el negocio (Google Fonts OFL)
  useEffect(() => {
    if (data) loadGoogleFonts(data.landing)
  }, [data])

  const openLightbox = (url) => setLightboxImage(url)
  const closeLightbox = () => setLightboxImage(null)

  const themeConfig = data ? getThemeConfig(data.empresa, data.landing) : {}

  return {
    data,
    error,
    lightboxImage,
    openLightbox,
    closeLightbox,
    themeConfig
  }
}
