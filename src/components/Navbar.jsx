import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="bg-amber-900 text-white p-4 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <h1 
          onClick={() => navigate('/')} 
          className="text-xl font-bold cursor-pointer hover:text-amber-200 transition"
        >
          🍽️ Restaurantes App
        </h1>
      </div>
    </nav>
  )
}

export default Navbar