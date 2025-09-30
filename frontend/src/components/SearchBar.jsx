// src/components/SearchBar.jsx
import './SearchBar.css';

function SearchBar({ onSearch }) {

  const handleChange = (event) => {
    onSearch(event.target.value);
  };

  return (
    <div className="search-bar-container">
      <input 
        type="text"
        placeholder="Buscar por código, descripción o escanear..."
        className="search-input"
        onChange={handleChange}
      />
    </div>
  );
}

export default SearchBar;