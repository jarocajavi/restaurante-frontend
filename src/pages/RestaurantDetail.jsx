import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function RestaurantDetail() {

  // ESTADOS
  const { id } = useParams();
  const navigate = useNavigate();
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orderDishes, setOrderDishes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("platos");
  const [sortField, setSortField] = useState("apellido1");
  const [sortDir, setSortDir] = useState("asc");
  const [orderSortField, setOrderSortField] = useState("pedidoID");
  const [orderSortDir, setOrderSortDir] = useState("asc");
  const [highlightedClienteID, setHighlightedClienteID] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const highlightRef = useRef(null);
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterPrecioMax, setFilterPrecioMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // FETCH DE DATOS
  useEffect(() => {
    setLoading(true);
    setActiveTab("platos");
    const fetchData = async () => {
      try {
        const [restRes, dishesRes, ordersRes, customersRes, categoriesRes] =
          await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/restaurants`),
            fetch(`${import.meta.env.VITE_API_URL}/dishes`),
            fetch(`${import.meta.env.VITE_API_URL}/orders`),
            fetch(`${import.meta.env.VITE_API_URL}/customers`),
            fetch(`${import.meta.env.VITE_API_URL}/categories`),
          ]);

        if (!restRes.ok) throw new Error(`Error restaurantes: ${restRes.status}`);
        if (!dishesRes.ok) throw new Error(`Error platos: ${dishesRes.status}`);
        if (!ordersRes.ok) throw new Error(`Error pedidos: ${ordersRes.status}`);
        if (!customersRes.ok) throw new Error(`Error clientes: ${customersRes.status}`);
        if (!categoriesRes.ok) throw new Error(`Error categorías: ${categoriesRes.status}`);

        const restData = await restRes.json();
        const dishesData = await dishesRes.json();
        const ordersData = await ordersRes.json();
        const customersData = await customersRes.json();
        const categoriesData = await categoriesRes.json();

        const filteredOrders = ordersData.filter(
          (o) => o.restauranteID === parseInt(id),
        );

        const orderDishesData = {};
        await Promise.all(
          filteredOrders.map(async (o) => {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/order/${o.pedidoID}/dishes`,
            );
            if (!res.ok) throw new Error(`Error platos pedido ${o.pedidoID}: ${res.status}`);
            const data = await res.json();
            orderDishesData[o.pedidoID] = data;
          }),
        );

        const clienteIdsDelRestaurante = [
          ...new Set(filteredOrders.map((o) => o.clienteID)),
        ];
        const filteredCustomers = customersData.filter((c) =>
          clienteIdsDelRestaurante.includes(c.clienteID),
        );

        setAllRestaurants(restData);
        setRestaurant(restData.find((r) => r.restauranteID === parseInt(id)));
        setDishes(dishesData.filter((d) => d.restauranteID === parseInt(id)));
        setOrders(filteredOrders);
        setCustomers(filteredCustomers);
        setCategories(categoriesData);
        setOrderDishes(orderDishesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // HELPERS
  const getCategoryName = (categoriaID) => {
    const cat = categories.find((c) => c.categoriaID === categoriaID);
    return cat ? cat.categoria : categoriaID;
  };

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const getCustomerName = (clienteID) => {
    const c = customers.find((c) => c.clienteID === clienteID);
    return c ? `${c.nombre} ${c.apellido1} ${c.apellido2}` : "Desconocido";
  };

  const handleClienteClick = (clienteID) => {
    setActiveTab("clientes");
    setSearch("");
    setTimeout(() => {
      setHighlightedClienteID(clienteID);
      setTimeout(() => setHighlightedClienteID(null), 2500);
    }, 50);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearch("");
    setFilterCategoria("");
    setFilterPrecioMax("");
    setShowFilters(false);
  };

  // EFFECT SCROLL AL HIGHLIGHT
  useEffect(() => {
    if (highlightedClienteID && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedClienteID]);

  // LÓGICA DE BÚSQUEDA Y FILTROS
  const q = search.toLowerCase().trim();

  const filteredDishes = dishes.filter((d) => {
    if (filterCategoria && d.categoriaID !== parseInt(filterCategoria)) return false;
    if (filterPrecioMax && parseFloat(d.precio) > parseFloat(filterPrecioMax)) return false;
    if (!q) return true;
    return (
      d.plato?.toLowerCase().includes(q) ||
      getCategoryName(d.categoriaID)?.toLowerCase().includes(q) ||
      String(d.precio).includes(q)
    );
  });

  const filteredOrders = [...orders].filter((o) => {
    if (!q) return true;
    const platosDelPedido = (orderDishes[o.pedidoID] || []).map((p) => p.plato.toLowerCase());
    return (
      String(o.pedidoID).includes(q) ||
      String(o.clienteID).includes(q) ||
      formatDate(o.fecha).includes(q) ||
      platosDelPedido.some((p) => p.includes(q)) ||
      getCustomerName(o.clienteID).toLowerCase().includes(q)
    );
  });

  const filteredCustomers = [...customers].filter((c) => {
    if (!q) return true;
    return (
      c.nombre?.toLowerCase().includes(q) ||
      c.apellido1?.toLowerCase().includes(q) ||
      c.apellido2?.toLowerCase().includes(q) ||
      c.poblacion?.toLowerCase().includes(q) ||
      String(c.clienteID).includes(q)
    );
  });

  // LOADING Y ERROR
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#1c0e04" }}>
        <p className="text-2xl text-amber-400 animate-pulse">Cargando datos...</p>
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#1c0e04" }}>
        <p className="text-2xl text-red-400">⚠️ {error}</p>
      </div>
    );

  const tabs = [
    { key: "platos", label: "🍴 Platos", count: dishes.length },
    { key: "pedidos", label: "📋 Pedidos", count: orders.length },
    { key: "clientes", label: "👥 Clientes", count: customers.length },
    { key: "ubicacion", label: "📍 Ubicación", count: null },
  ];

  return (
    <div className="h-screen flex flex-col text-white" style={{ background: "#1c0e04" }}>
      <Navbar />

      {/* Contenedor principal */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginTop: "80px", marginBottom: "48px" }}>

        {/* CABECERA FIJA */}
        <div className="flex-shrink-0 px-8 pt-5 pb-0" style={{ background: "#1c0e04" }}>

          {/* Fila: volver + otros restaurantes */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-1.5 rounded-lg border border-stone-700 text-stone-300 hover:border-amber-500 hover:text-amber-400 transition-colors text-sm flex-shrink-0"
            >
              ← Volver
            </button>
            <span className="text-stone-700 text-sm">|</span>
            {allRestaurants
              .filter((r) => r.restauranteID !== parseInt(id))
              .map((r) => (
                <button
                  key={r.restauranteID}
                  onClick={() => navigate(`/restaurant/${r.restauranteID}`)}
                  className="px-3 py-1.5 rounded-lg border border-stone-800 text-stone-400 hover:border-amber-500 hover:text-amber-300 transition-colors text-xs"
                >
                  {r.restaurante}
                </button>
              ))}
          </div>

          {/* Nombre restaurante */}
          <h1 className="text-3xl font-black text-white mb-1">{restaurant?.restaurante}</h1>
          <p className="text-amber-500 mb-4 text-sm">📍 {restaurant?.barrio}</p>

          {/* Pestañas + búsqueda */}
          <div className="flex items-end justify-between border-b border-stone-800">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-5 py-3 text-sm font-semibold rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.key
                      ? "bg-stone-900 text-amber-400 border-b-2 border-amber-400"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {tab.label}
{tab.count !== null && (
  <span className={`text-xs px-2 py-0.5 rounded-full ${
    activeTab === tab.key
      ? "bg-amber-500/20 text-amber-400"
      : "bg-stone-800 text-stone-500"
  }`}>
    {tab.count}
  </span>
)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-1">
              {activeTab === "platos" && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    showFilters || filterCategoria || filterPrecioMax
                      ? "border-amber-500 text-amber-400 bg-amber-500/10"
                      : "border-stone-700 text-stone-400 hover:border-amber-500 hover:text-amber-400"
                  }`}
                >
                  ⚙ Filtros {(filterCategoria || filterPrecioMax) ? "●" : ""}
                </button>
              )}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-8 pr-3 py-1.5 rounded-lg text-sm border text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors w-48"
                  style={{ background: "#2a1506", borderColor: "#44271a" }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
                  >✕</button>
                )}
              </div>
            </div>
          </div>

          {/* Panel filtros platos */}
          {activeTab === "platos" && showFilters && (
            <div className="flex gap-4 items-end py-3 px-1">
              <div>
                <label className="text-xs text-amber-400 font-semibold mb-1 block">Categoría</label>
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-sm border text-stone-200 focus:outline-none focus:border-amber-500 transition-colors"
                  style={{ background: "#2a1506", borderColor: "#44271a" }}
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.categoriaID} value={cat.categoriaID}>{cat.categoria}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-amber-400 font-semibold mb-1 block">Precio máximo (€)</label>
                <input
                  type="number"
                  value={filterPrecioMax}
                  onChange={(e) => setFilterPrecioMax(e.target.value)}
                  placeholder="Ej: 15"
                  className="px-3 py-1.5 rounded-lg text-sm border text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors w-32"
                  style={{ background: "#2a1506", borderColor: "#44271a" }}
                />
              </div>
              <button
                onClick={() => { setFilterCategoria(""); setFilterPrecioMax(""); }}
                className="px-3 py-1.5 rounded-lg text-xs border border-stone-700 text-stone-400 hover:border-red-500 hover:text-red-400 transition-colors"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* ÁREA SCROLLABLE: solo la tabla */}
        <div className="flex-1 overflow-y-auto px-8 pb-4">

          {/* PESTAÑA PLATOS */}
          {activeTab === "platos" && (
            <table className="w-full text-left" style={{ background: "#2a1506" }}>
              <thead className="sticky top-0 z-10" style={{ background: "#2a1506" }}>
                <tr className="border-b border-stone-700">
                  <th className="p-4 text-amber-400 font-semibold">Nombre</th>
                  <th className="p-4 text-amber-400 font-semibold">Precio</th>
                  <th className="p-4 text-amber-400 font-semibold">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {filteredDishes.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-stone-500">Sin resultados</td></tr>
                ) : (
                  filteredDishes.map((d) => (
                    <tr key={d.platoID} className="border-b border-stone-800 hover:bg-stone-800/30 transition-colors">
                      <td className="p-4 text-stone-200">{d.plato}</td>
                      <td className="p-4 text-amber-400 font-semibold">{d.precio} €</td>
                      <td className="p-4">
                        <span
  onClick={() => {
    setFilterCategoria(String(d.categoriaID))
    setShowFilters(true)
  }}
  className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer hover:bg-amber-500/40 transition-colors"
>
  {getCategoryName(d.categoriaID)}
</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* PESTAÑA PEDIDOS */}
          {activeTab === "pedidos" && (
            <table className="w-full text-left" style={{ background: "#2a1506" }}>
              <thead className="sticky top-0 z-10" style={{ background: "#2a1506" }}>
                <tr className="border-b border-stone-700">
                  {[
                    { key: "pedidoID", label: "ID Pedido" },
                    { key: "clienteID", label: "Cliente" },
                    { key: "fecha", label: "Fecha" },
                    { key: null, label: "Platos" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      className={`p-4 text-amber-400 font-semibold ${col.key ? "cursor-pointer hover:text-amber-300 transition-colors" : ""}`}
                      onClick={() => {
                        if (!col.key) return;
                        if (orderSortField === col.key) {
                          setOrderSortDir(orderSortDir === "asc" ? "desc" : "asc");
                        } else {
                          setOrderSortField(col.key);
                          setOrderSortDir("asc");
                        }
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {col.label}
                        {col.key && (
                          <span className="text-xs">
                            {orderSortField === col.key ? (orderSortDir === "asc" ? "▲" : "▼") : "⇅"}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-stone-500">Sin resultados</td></tr>
                ) : (
                  filteredOrders
                    .sort((a, b) => {
                      const valA = a[orderSortField];
                      const valB = b[orderSortField];
                      if (typeof valA === "number") return orderSortDir === "asc" ? valA - valB : valB - valA;
                      return orderSortDir === "asc"
                        ? String(valA).localeCompare(String(valB))
                        : String(valB).localeCompare(String(valA));
                    })
                    .map((o) => {
                      const platosDelPedido = orderDishes[o.pedidoID] || [];
                      return (
                        <tr key={o.pedidoID} className="border-b border-stone-800 hover:bg-stone-800/30 transition-colors">
                          <td className="p-4 text-amber-400 font-mono">#{o.pedidoID}</td>
                          <td className="p-4">
                            <div className="relative group inline-block">
                              <span
                                onClick={() => handleClienteClick(o.clienteID)}
                                className="cursor-pointer text-amber-500 hover:text-amber-300 underline underline-offset-2 transition-colors font-mono text-sm"
                              >
                                #{o.clienteID}
                              </span>
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 bg-stone-900 border border-amber-500/30 text-stone-200 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                                {getCustomerName(o.clienteID)}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-stone-400">{formatDate(o.fecha)}</td>
                          <td className="p-4 text-stone-300 text-sm">{platosDelPedido.map((p) => p.plato).join(", ")}</td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          )}

          {/* PESTAÑA CLIENTES */}
          {activeTab === "clientes" && (
            <table className="w-full text-left" style={{ background: "#2a1506" }}>
              <thead className="sticky top-0 z-10" style={{ background: "#2a1506" }}>
                <tr className="border-b border-stone-700">
                  {[
                    { key: "nombre", label: "Nombre" },
                    { key: "apellido1", label: "Apellido" },
                    { key: "poblacion", label: "Población" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="p-4 text-amber-400 font-semibold cursor-pointer select-none hover:text-amber-300 transition-colors"
                      onClick={() => {
                        if (sortField === col.key) {
                          setSortDir(sortDir === "asc" ? "desc" : "asc");
                        } else {
                          setSortField(col.key);
                          setSortDir("asc");
                        }
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {col.label}
                        <span className="text-xs">
                          {sortField === col.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-stone-500">Sin resultados</td></tr>
                ) : (
                  filteredCustomers
                    .sort((a, b) => {
                      const valA = (a[sortField] || "").toLowerCase();
                      const valB = (b[sortField] || "").toLowerCase();
                      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                    })
                    .map((c) => (
                      <tr
                        key={c.clienteID}
                        ref={highlightedClienteID === c.clienteID ? highlightRef : null}
                        onClick={() => setSelectedCliente(c)}
                        className={`border-b border-stone-800 transition-all duration-300 cursor-pointer ${
                          highlightedClienteID === c.clienteID
                            ? "bg-amber-400/30 border-l-4 border-l-amber-400"
                            : "hover:bg-stone-800/30"
                        }`}
                      >
                        <td className="p-4 text-stone-200">{c.nombre} {c.apellido1} {c.apellido2}</td>
                        <td className="p-4 text-stone-400">{c.apellido1}</td>
                        <td className="p-4 text-stone-400">{c.poblacion}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* FOOTER — fuera de cualquier overflow para que siempre sea visible */}
      <Footer />

{/* PESTAÑA UBICACIÓN */}
{activeTab === "ubicacion" && (
  <div className="rounded-2xl overflow-hidden" style={{ height: '500px' }}>
    <iframe
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      src={`https://www.google.com/maps?q=${encodeURIComponent(
        `${restaurant?.restaurante}, ${restaurant?.barrio}, Zaragoza`
      )}&output=embed`}
    />
  </div>
)}

      {/* MODAL CLIENTE */}
      {selectedCliente && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedCliente(null)}
        >
          <div
            className="relative w-full max-w-2xl mx-4 rounded-2xl p-6 shadow-2xl border border-amber-500/20"
            style={{ background: "#2a1506" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedCliente.nombre} {selectedCliente.apellido1} {selectedCliente.apellido2}
                </h3>
                <p className="text-stone-400 text-sm mt-1">📍 {selectedCliente.poblacion}</p>
              </div>
              <button
                onClick={() => setSelectedCliente(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-amber-600 transition-colors flex items-center justify-center text-stone-300"
              >✕</button>
            </div>
            <h4 className="text-amber-400 font-semibold mb-3 text-sm uppercase tracking-wider">
              Pedidos ({orders.filter((o) => o.clienteID === selectedCliente.clienteID).length})
            </h4>
            <div className="overflow-y-auto max-h-80 rounded-xl">
              <table className="w-full text-left" style={{ background: "#1c0e04" }}>
                <thead>
                  <tr className="border-b border-stone-700">
                    <th className="p-3 text-amber-400 font-semibold text-sm">ID Pedido</th>
                    <th className="p-3 text-amber-400 font-semibold text-sm">Fecha</th>
                    <th className="p-3 text-amber-400 font-semibold text-sm">Platos</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter((o) => o.clienteID === selectedCliente.clienteID)
                    .map((o) => (
                      <tr key={o.pedidoID} className="border-b border-stone-800">
                        <td className="p-3 text-amber-400 font-mono text-sm">#{o.pedidoID}</td>
                        <td className="p-3 text-stone-400 text-sm">{formatDate(o.fecha)}</td>
                        <td className="p-3 text-stone-300 text-sm">
                          {(orderDishes[o.pedidoID] || []).map((p) => p.plato).join(", ")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantDetail;