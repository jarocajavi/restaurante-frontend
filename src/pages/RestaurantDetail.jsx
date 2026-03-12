import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [dishes, setDishes] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, dishesRes, ordersRes, customersRes] = await Promise.all([
          fetch('http://localhost:4000/restaurants'),
          fetch('http://localhost:4000/dishes'),
          fetch('http://localhost:4000/orders'),
          fetch('http://localhost:4000/customers')
        ])
        const restData = await restRes.json()
        const dishesData = await dishesRes.json()
        const ordersData = await ordersRes.json()
        const customersData = await customersRes.json()

        setRestaurant(restData.find(r => r.restauranteID === parseInt(id)))
        setDishes(dishesData.filter(d => d.restauranteID === parseInt(id)))
        setOrders(ordersData.filter(o => o.restauranteID === parseInt(id)))
        setCustomers(customersData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <p className="text-2xl text-amber-800">Cargando datos...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-amber-50 p-8">
        <Navbar />
<div className='p-8'>
      <button
        onClick={() => navigate('/')}
        className="mb-6 bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition"
      >
        ← Volver
      </button>

      <h1 className="text-4xl font-bold text-amber-900 mb-1">{restaurant?.restaurante}</h1>
      <p className="text-amber-600 mb-8">📍 {restaurant?.barrio}</p>

      {/* Platos */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-amber-800 mb-4">🍴 Platos</h2>
        <div className="overflow-x-auto rounded-2xl shadow">
          <table className="w-full bg-white text-left">
            <thead className="bg-amber-800 text-white">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Categoría</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((d, i) => (
                <tr key={d.platoID} className={i % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                  <td className="p-3">{d.plato}</td>
                  <td className="p-3">{d.precio} €</td>
                  <td className="p-3">{d.categoriaID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pedidos */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-amber-800 mb-4">📋 Pedidos</h2>
        <div className="overflow-x-auto rounded-2xl shadow">
          <table className="w-full bg-white text-left">
            <thead className="bg-amber-800 text-white">
              <tr>
                <th className="p-3">ID Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => {
                const customer = customers.find(c => c.clienteID === o.clienteID)
                return (
                  <tr key={o.pedidoID} className={i % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                    <td className="p-3">#{o.pedidoID}</td>
                    <td className="p-3">{customer ? customer.cliente : 'Desconocido'}</td>
                    <td className="p-3">{o.fecha}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Clientes */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-amber-800 mb-4">👥 Clientes</h2>
        <div className="overflow-x-auto rounded-2xl shadow">
          <table className="w-full bg-white text-left">
            <thead className="bg-amber-800 text-white">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Email</th>
                <th className="p-3">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .filter(c => orders.some(o => o.clienteID === c.clienteID))
                .map((c, i) => (
                  <tr key={c.clienteID} className={i % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                    <td className="p-3">{c.cliente}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.telefono}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div></div>
  )
}

export default RestaurantDetail