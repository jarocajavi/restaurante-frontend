import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://localhost:4000/restaurants')
      .then(res => res.json())
      .then(data => {
        setRestaurants(data)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <p className="text-2xl text-amber-800">Cargando restaurantes...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      <h1 className="text-4xl font-bold text-center text-amber-900 mb-2">🍽️ Restaurantes</h1>
      <p className="text-center text-amber-700 mb-8">Elige un restaurante para ver sus detalles</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {restaurants.map(r => (
          <div
            key={r.restauranteID}
            onClick={() => navigate(`/restaurant/${r.restauranteID}`)}
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border border-amber-100"
          >
            <h2 className="text-xl font-bold text-amber-900">{r.restaurante}</h2>
            <p className="text-amber-600 mt-1">📍 {r.barrio}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home