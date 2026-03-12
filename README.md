# Restaurante Frontend

Aplicación web desarrollada con React que consume la API del proyecto [restaurante-backend](https://github.com/juanda99/restaurante-backend) y permite visualizar restaurantes, sus platos, pedidos y clientes.

## 🌐 Despliegue

La aplicación está desplegada en GitHub Pages:
https://jarocajavi.github.io/restaurante-frontend

> ⚠️ Para que la aplicación funcione correctamente es necesario tener el backend corriendo en local.

## 🚀 Ejecución en local

### 1. Levantar el backend
```bash
git clone https://github.com/juanda99/restaurante-backend
cd restaurante-backend
docker compose up -d
```

### 2. Levantar el frontend
```bash
git clone https://github.com/jarocajavi/restaurante-frontend
cd restaurante-frontend
npm install
npm run dev
```

Abrir en el navegador: http://localhost:5173

## ✅ Requisitos del proyecto

- **Consumo de API externa**: Se usa `fetch` con `async/await` para obtener datos de `http://localhost:4000`
- **Hooks de React**: Se usan `useState` y `useEffect` en todas las páginas
- **React Router**: Rutas `/` para el listado y `/restaurant/:id` para el detalle
- **Responsive**: Diseño adaptado a móvil y escritorio con Tailwind CSS
- **Componentes**: `Navbar`, `Home`, `RestaurantDetail`
- **Bundler**: Vite
- **Despliegue**: GitHub Pages con gh-pages

## 🛠️ Tecnologías

- React 19
- Vite 8
- React Router DOM
- Tailwind CSS
- gh-pages