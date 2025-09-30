// src/components/AdminPanel.jsx
import { useState } from 'react';
import api from '../services/api';

function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [product, setProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleProductSearch = async () => {
    if (!searchTerm) return;
    try {
      const response = await api.searchProducts(searchTerm);
      if (response.data.length > 0) {
        setProduct(response.data[0]); // Seleccionamos el primer resultado
        setMessage('');
      } else {
        setProduct(null);
        setMessage('Producto no encontrado.');
      }
    } catch (error) {
      setMessage('Error al buscar el producto.');
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !product) {
      setMessage('Por favor, seleccione un producto y un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('CodProd', product.CodProd);

    try {
      const response = await api.uploadProductImage(formData); // Necesitamos crear esta función en api.js
      setMessage(response.data.success);
    } catch (error) {
      setMessage('Error al subir la imagen.');
    }
  };

  return (
    <div>
      <h2>Panel para Cargar Imágenes de Productos</h2>
      <div>
        <input 
          type="text" 
          placeholder="Buscar producto por código"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleProductSearch}>Buscar</button>
      </div>

      {message && <p>{message}</p>}

      {product && (
        <div>
          <h3>Producto Seleccionado: {product.Descrip}</h3>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={!selectedFile}>Subir Imagen</button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;