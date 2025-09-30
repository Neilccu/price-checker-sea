// src/App.jsx (versión final y completa)

import { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';
import AdminPanel from './components/AdminPanel';

// Paso 1: Importamos los componentes que creamos
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import CategoryList from './components/CategoryList';

function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [error, setError] = useState(null);

    // --- EFECTOS ---
  // Este useEffect se ejecuta UNA SOLA VEZ cuando el componente se carga
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    fetchCategories();
  }, []); // <-- El array vacío [] asegura que se ejecute solo una vez

  const handleSearch = async (searchTerm) => {
    // Evitamos búsquedas vacías o muy cortas para no sobrecargar el backend
    if (!searchTerm || searchTerm.length < 3) {
      setProducts([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.searchProducts(searchTerm);

        // Línea de depuración:
      console.log("Datos recibidos del backend:", response.data); 

      setProducts(response.data);
    } catch (error) {
      console.error("Error al buscar productos:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="app-container">
      {/* 1. Barra de navegación para cambiar de vista */}
      <nav className="app-nav">
        <h2>Mi Aplicación</h2>
        <button onClick={() => setIsAdminView(!isAdminView)} className="nav-button">
          {isAdminView ? 'Ver Lector' : 'Administrar'}
        </button>
      </nav>

      {/* 2. La lógica de decisión (Renderizado Condicional) */}
      {isAdminView ? (
        // Si isAdminView es TRUE, muestra solo esto:
        <AdminPanel />
      ) : (
        // Si isAdminView es FALSE, muestra todo esto:
        <>
          <header className="app-header">
            <h1>Lector de Precios</h1>
            <SearchBar onSearch={handleSearch} />
          </header>
          
          <CategoryList categories={categories} onCategoryClick={handleSearch} />
          
          <main>
            {isLoading ? (
              <p>Cargando...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : products.length > 0 ? (
              <ProductList products={products} />
            ) : (
              <p className="empty-message">Inicie una búsqueda para ver los resultados.</p>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;