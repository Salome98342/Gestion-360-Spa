import { useParams } from 'react-router-dom'
import { useLanding } from '../hooks/useLanding'
import Navigation from '../components/landing/Navigation'
import Hero from '../components/landing/Hero'
import Services from '../components/landing/Services'
import Gallery from '../components/landing/Gallery'
import Footer from '../components/landing/Footer'
import Lightbox from '../components/landing/Lightbox'
import './LandingEmpresa.css'

export default function LandingEmpresa() {
  const { slug } = useParams()
  const { 
    data, 
    error, 
    lightboxImage, 
    openLightbox, 
    closeLightbox,
    themeConfig
  } = useLanding(slug)

  if (error) {
    return (
      <main className="tenant-state tenant-error">
        No fue posible cargar este negocio: {error}
      </main>
    )
  }

  if (!data) {
    return (
      <main className="tenant-state">
        Cargando la experiencia del negocio…
      </main>
    )
  }

  const { empresa, landing, servicios } = data

  return (
    <div className="tenant tenant-landing" style={themeConfig}>
      <Navigation empresa={empresa} slug={slug} />
      
      <Hero empresa={empresa} landing={landing} slug={slug} />
      
      <Services 
        servicios={servicios} 
        showPrices={landing.mostrar_precios} 
      />
      
      <Gallery 
        urls={landing.galeria_urls} 
        onImageClick={openLightbox} 
      />
      
      <Footer empresa={empresa} landing={landing} />
      
      <Lightbox image={lightboxImage} onClose={closeLightbox} />
    </div>
  )
}
