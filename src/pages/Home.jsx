import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const RESTAURANT_IMAGES = {
  1: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  2: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  3: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  4: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  5: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80',
}

function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const sliderRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/restaurants`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
        return res.json()
      })
      .then((data) => setRestaurants(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const scroll = (dir) => {
    if (!sliderRef.current) return
    const cardWidth = sliderRef.current.querySelector('div')?.offsetWidth || 300
    sliderRef.current.scrollBy({ left: dir * (cardWidth + 24), behavior: 'smooth' })
  }

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#1c0e04' }}>
        <p className="text-2xl text-amber-400 animate-pulse">Cargando restaurantes...</p>
      </div>
    )

  if (error)
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#1c0e04' }}>
        <p className="text-2xl text-red-400">⚠️ {error}</p>
      </div>
    )

  return (
    <div className="h-screen flex flex-col overflow-hidden text-white" style={{ background: '#1c0e04' }}>
      <Navbar />

      {/* Área principal */}
      <div className="flex-1 relative" style={{ marginTop: '80px', marginBottom: '48px' }}>

        {/* Imagen de fondo */}
        <img
          src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1600&q=80"
          alt="Zaragoza vista aérea"
          className="absolute inset-0 w-full h-full object-cover opacity-75"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80' }}
        />

        {/* Degradado */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/20 via-transparent to-[#1c0e04]" />

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 pt-10">

          {/* Título */}
          <div className="text-center">
            <p className="text-amber-400 text-sm uppercase tracking-[0.3em] font-semibold mb-3">
              Zaragoza Gastronómica
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl mb-4">
              🍽️ Restaurantes
            </h1>
            <p className="text-stone-300 text-lg max-w-md mx-auto">
              Descubre los mejores rincones gastronómicos de la ciudad
            </p>
          </div>

          {/* Slider + flechas */}
          <div className="flex flex-col gap-3">

            {/* Slider */}
            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
            >
              {restaurants.map((r) => (
                <div
                  key={r.restauranteID}
                  onClick={() => navigate(`/restaurant/${r.restauranteID}`)}
                  className="
                    flex-none cursor-pointer group rounded-2xl overflow-hidden
                    hover:ring-2 hover:ring-amber-500 transition-all duration-300
                    w-[calc(50vw-32px)]
                    sm:w-[calc(33.333vw-32px)]
                    lg:w-[calc(25vw-32px)]
                    2xl:w-[calc(20vw-32px)]
                  "
                  style={{ background: 'rgba(28, 14, 4, 0.75)', backdropFilter: 'blur(8px)' }}
                >
                  {/* Imagen con aspect ratio fijo para no deformar */}
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <img
                      src={RESTAURANT_IMAGES[r.restauranteID] || RESTAURANT_IMAGES[1]}
                      alt={r.restaurante}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {r.restaurante}
                    </h3>
                    <p className="text-stone-400 text-sm mt-1">📍 {r.barrio}</p>
                    <span className="inline-block mt-2 text-xs text-amber-500 font-semibold uppercase tracking-wider">
                      Ver detalles →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Flechas */}
            <div className="flex justify-center gap-4">
<button
  onClick={() => scroll(-1)}
  className="w-10 h-10 rounded-full border border-stone-600 hover:border-amber-400 hover:bg-amber-600 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-white text-lg"
  style={{ background: 'rgba(41, 37, 36, 0.9)', backdropFilter: 'blur(4px)' }}
>
  ←
</button>
<button
  onClick={() => scroll(1)}
  className="w-10 h-10 rounded-full border border-stone-600 hover:border-amber-400 hover:bg-amber-600 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-white text-lg"
  style={{ background: 'rgba(41, 37, 36, 0.9)', backdropFilter: 'blur(4px)' }}
>
  →
</button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Home