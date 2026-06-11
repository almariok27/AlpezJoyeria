import React from 'react';
import { Link } from 'react-router-dom';
import './ProductoTarjeta.css';

export default function ProductoTarjeta({ producto }) {

  const nombre = producto?.nombre || "PULSERA SAN BENITO Y DOS ESFERAS";
  const precio = producto?.precio
  ? `$ ${producto.precio.toLocaleString()}`
  : "$ 223.000";
  const imagen = producto?.imagenes?.[0] || "https://via.placeholder.com/300";
  const id = producto?.id;

  return (
    <Link to={`/${id}`} state={{ producto }} style={{ textDecoration: 'none' }}>
      <article className="tarjeta-producto" style={{ cursor: 'pointer' }}>
        <div className="imagen-contenedor">
          <img src={imagen} alt={nombre} className="tarjeta-imagen" />
        </div>

        <div className="tarjeta-info">
          <h2 className="tarjeta-titulo">{nombre}</h2>

          <div className="tarjeta-footer">
            <span className="tarjeta-precio">{precio}</span>

            <button
              className="boton-carrito"
              aria-label="Agregar al carrito"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
