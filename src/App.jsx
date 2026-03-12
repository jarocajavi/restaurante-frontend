import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RestaurantDetail from './pages/RestaurantDetail'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
      </Routes>
    </HashRouter>
  )
}

export default App