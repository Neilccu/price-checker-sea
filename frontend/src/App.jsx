// src/App.jsx (versión final y completa)

import { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';

// Paso 1: Importamos los componentes que creamos
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import CategoryList from './components/CategoryList';

function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

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
      <header className="app-header">
        <h1>Lector de Precios</h1>
        {/* Paso 2: Usamos el componente SearchBar aquí */}
        <SearchBar onSearch={handleSearch} />
      </header>

      <CategoryList categories={categories} onCategoryClick={handleSearch} />

      <main>
        {isLoading 
          ? <p>Cargando productos...</p>
          // Paso 3: Y usamos el componente ProductList aquí
          : <ProductList products={products} />
        }
      </main>
    </div>
  );
}

export default App;