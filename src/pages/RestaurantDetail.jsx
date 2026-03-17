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
  const [categories, setCategories] = useState([])
  const [orderDishes, setOrderDishes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ==========================================
        // FETCH PARALELO: obtenemos todos los datos a la vez
        // ==========================================
        const [restRes, dishesRes, ordersRes, customersRes, categoriesRes] =
          await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/restaurants`),
            fetch(`${import.meta.env.VITE_API_URL}/dishes`),
            fetch(`${import.meta.env.VITE_API_URL}/orders`),
            fetch(`${import.meta.env.VITE_API_URL}/customers`),
            fetch(`${import.meta.env.VITE_API_URL}/categories`),
          ])

        // ✅ FIX: Validar res.ok en todas las respuestas
        if (!restRes.ok) throw new Error(`Error restaurantes: ${restRes.status}`)
        if (!dishesRes.ok) throw new Error(`Error platos: ${dishesRes.status}`)
        if (!ordersRes.ok) throw new Error(`Error pedidos: ${ordersRes.status}`)
        if (!customersRes.ok) throw new Error(`Error clientes: ${customersRes.status}`)
        if (!categoriesRes.ok) throw new Error(`Error categorías: ${categoriesRes.status}`)

        const restData = await restRes.json()
        const dishesData = await dishesRes.json()
        const ordersData = await ordersRes.json()
        const customersData = await customersRes.json()
        const categoriesData = await categoriesRes.json()

        const filteredOrders = ordersData.filter(
          (o) => o.restauranteID === parseInt(id),
        )

        // ==========================================
        // ✅ FIX N+1: Una sola petición para todos los platos de pedidos
        // En vez de un fetch por cada pedido, traemos todos y filtramos
        // ==========================================
        const allOrderDishesRes = await fetch(
          `${import.meta.env.VITE_API_URL}/order-dishes`,
        )
        if (!allOrderDishesRes.ok)
          throw new Error(`Error platos de pedidos: ${allOrderDishesRes.status}`)
        const allOrderDishesData = await allOrderDishesRes.json()

        const orderDishesData = {}
        filteredOrders.forEach((o) => {
          orderDishesData[o.pedidoID] = allOrderDishesData.filter(
            (d) => d.pedidoID === o.pedidoID,
          )
        })

        setRestaurant(restData.find((r) => r.restauranteID === parseInt(id)))
        setDishes(dishesData.filter((d) => d.restauranteID === parseInt(id)))
        setOrders(filteredOrders)
        setCustomers(customersData)
        setCategories(categoriesData)
        setOrderDishes(orderDishesData)
      } catch (err) {
        // ✅ FIX: Mostrar error al usuario, no solo en consola
        setError(err.message)
      } finally {
        // ✅ FIX: finally garantiza que loading siempre se desactiva
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const getCategoryName = (categoriaID) => {
    const cat = categories.find((c) => c.categoriaID === categoriaID)
    return cat ? cat.categoria : categoriaID
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-2xl text-amber-800">Cargando datos...</p>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-2xl text-red-600">⚠️ {error}</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <div className="p-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition"
        >
          ← Volver
        </button>

        <h1 className="text-4xl font-bold text-amber-900 mb-1">
          {restaurant?.restaurante}
        </h1>
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
                  <tr
                    key={d.platoID}
                    className={i % 2 === 0 ? 'bg-amber-50' : 'bg-white'}
                  >
                    <td className="p-3">{d.plato}</td>
                    <td className="p-3">{d.precio} €</td>
                    <td className="p-3">{getCategoryName(d.categoriaID)}</td>
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
                  <th className="p-3">Platos del pedido</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => {
                  const customer = customers.find(
                    (c) => c.clienteID === o.clienteID,
                  )
                  const platosDelPedido = orderDishes[o.pedidoID] || []
                  return (
                    <tr
                      key={o.pedidoID}
                      className={i % 2 === 0 ? 'bg-amber-50' : 'bg-white'}
                    >
                      <td className="p-3">#{o.pedidoID}</td>
                      <td className="p-3">
                        {customer ? customer.cliente : 'Desconocido'}
                      </td>
                      <td className="p-3">{o.fecha}</td>
                      <td className="p-3 text-sm text-amber-700">
                        {platosDelPedido.map((p) => p.plato).join(', ')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Clientes */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">
            👥 Clientes
          </h2>
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
                  .filter((c) =>
                    orders.some((o) => o.clienteID === c.clienteID),
                  )
                  .map((c, i) => (
                    <tr
                      key={c.clienteID}
                      className={i % 2 === 0 ? 'bg-amber-50' : 'bg-white'}
                    >
                      <td className="p-3">{c.cliente}</td>
                      <td className="p-3">{c.email}</td>
                      <td className="p-3">{c.telefono}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RestaurantDetail