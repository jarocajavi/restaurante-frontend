import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 shadow-lg border-b border-stone-800"
      style={{ background: '#1c0e04' }}
    >
      <div
        onClick={() => navigate('/')}
        className="flex items-center gap-4 cursor-pointer group"
      >
        <span className="text-5xl drop-shadow-lg select-none">🍩</span>
        <div>
          <h1 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors leading-tight">
            Catálogo de restaurantes <em className="text-amber-400 italic">bolisintape</em>
          </h1>
          <p className="text-xs text-stone-500 italic">Mmm... donuts</p>
        </div>
      </div>
    </nav>
  )
}

export default Navbar