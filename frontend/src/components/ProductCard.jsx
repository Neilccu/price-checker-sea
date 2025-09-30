// src/components/ProductCard.jsx
import './ProductCard.css';

// Imagen de respaldo por si un producto no tiene foto
const placeholderImage = 'https://via.placeholder.com/150';

function ProductCard({ product }) {
  const imageUrl = product.ImagePath 
    ? `http://127.0.0.1:5000/images/${product.ImagePath}`
    : placeholderImage;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={imageUrl} alt={product.Descrip} className="product-image" />
      </div>
      <div className="product-info">
        <h3 className="product-description">{product.Descrip}</h3>
        <p className="product-code">Código: {product.CodProd}</p>
        <div className="product-prices">
          <span className="price-label">Precio 1:</span>
          <span className="price-value">${parseFloat(product.Precio1).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;