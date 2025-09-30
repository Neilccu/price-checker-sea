// src/App.jsx (versión final y completa)

import { useState } from 'react';
import api from './services/api';
import './App.css';

// Paso 1: Importamos los componentes que creamos
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';

function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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