import React from 'react';
import './FiltrosProductos.css';

export default function FiltrosProductos({ 
  precioOrden, 
  setPrecioOrden, 
  categoriaFiltro, 
  setCategoria,
  categoriasDisponibles 
}) {
  return (
    <div className="filtros-wrapper">
      {/* Filtro de Precio */}
      <div className="filtro-group">
        <select 
          id="precio-orden"
          value={precioOrden} 
          onChange={(e) => setPrecioOrden(e.target.value)}
          className="filtro-select"
        >
          <option value="">Precios</option>
          <option value="asc">Menor a Mayor</option>
          <option value="desc">Mayor a Menor</option>
        </select>
      </div>

      {/* Filtro de Categoría */}
      <div className="filtro-group">
        <select 
          id="categoria-filtro"
          value={categoriaFiltro} 
          onChange={(e) => setCategoria(e.target.value)}
          className="filtro-select"
        >
          <option value="">Categorías</option>
          {categoriasDisponibles.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
