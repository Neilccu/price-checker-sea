// src/components/ProductList.jsx
import ProductCard from './ProductCard';
import './ProductList.css';

function ProductList({ products }) {
  if (products.length === 0) {
    return <p className="empty-message">No se encontraron productos. Intente otra búsqueda.</p>;
  }

  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard key={product.CodProd} product={product} />
      ))}
    </div>
  );
}

export default ProductList;