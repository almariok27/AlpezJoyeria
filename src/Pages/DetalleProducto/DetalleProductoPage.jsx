import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DetalleProducto from '../../componentes/DetalleProducto/DetalleProducto';
import NotFound from '../NotFound/NotFound';

function DetalleProductoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener el producto del estado de navegación
  const producto = location.state?.producto;

  // Si no existe el producto, mostrar página 404
  if (!producto) {
    return <NotFound />;
  }

  return (
    <DetalleProducto
      producto={producto}
      onVolver={() => navigate('/')}
    />
  );
}

export default DetalleProductoPage;
