// src/components/CategoryList.jsx
import './CategoryList.css';

function CategoryList({ categories, onCategoryClick }) {
  return (
    <div className="category-list-container">
      <h4>Navegar por Categorías:</h4>
      <div className="category-list">
        {categories.map((category) => (
          <button 
            key={category.CodInst} 
            className="category-button"
            onClick={() => onCategoryClick(category.Descrip)}
          >
            {category.Descrip}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryList;