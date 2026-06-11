import { useContext } from 'react';
import { AdminViewContext } from '../../contexto/AdminViewContext';
import AdminMenu from '../../componentes/AdminMenu/AdminMenu';
import InventarioAdmin from '../../componentes/InventarioAdmin/InventarioAdmin';
import ProductosAdmin from '../../componentes/ProductosAdmin/ProductosAdmin';
import RegistrarVenta from '../../componentes/VentasAdmin/VentasAdmin';
import BalanceAdmin from '../../componentes/BalanceAdmin/BalanceAdmin';
import './Admin.css';

export default function Admin() {
  const { activeView } = useContext(AdminViewContext);

  return (
    <div className="admin-page">
      {/* SIDEBAR IZQUIERDO */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Panel Admin</h2>
        </div>
        <AdminMenu />
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="admin-main">
        <div className="admin-content">
          {activeView === 'inventario' && <InventarioAdmin />}
          {activeView === 'productos' && <ProductosAdmin />}
          {activeView === 'registrar-venta' && <RegistrarVenta />}
          {activeView === 'balance' && <BalanceAdmin />}
        </div>
      </main>
    </div>
  );
}