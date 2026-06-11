import React, { useState } from 'react';
import { useContext } from 'react';
import { AdminViewContext } from '../../contexto/AdminViewContext';
import './AdminMenu.css';

export default function AdminMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeView, setActiveView } = useContext(AdminViewContext);

  const handleSelectView = (view) => {
    setActiveView(view);
    setIsOpen(false);
  };

  return (
    <div className={`admin-menu-wrapper ${isOpen ? 'open' : ''}`}>
      <button
        className="admin-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Menú de Admin"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      </button>

      <div className="admin-menu-dropdown">

          <button
            className={`admin-menu-item ${activeView === 'inventario' ? 'active' : ''}`}
            onClick={() => handleSelectView('inventario')}
          >
            <span className="admin-menu-icon">📦</span>
            <span>Inventario</span>
          </button>

          <button
            className={`admin-menu-item ${activeView === 'productos' ? 'active' : ''}`}
            onClick={() => handleSelectView('productos')}
          >
            <span className="admin-menu-icon">🛍️</span>
            <span>Productos</span>
          </button>

          <button
            className={`admin-menu-item ${activeView === 'registrar-venta' ? 'active' : ''}`}
            onClick={() => handleSelectView('registrar-venta')}
          >
            <span className="admin-menu-icon">💳</span>
            <span>Ventas</span>
          </button>

          <button
            className={`admin-menu-item ${activeView === 'balance' ? 'active' : ''}`}
            onClick={() => handleSelectView('balance')}
          >
            <span className="admin-menu-icon">📊</span>
            <span>Balance</span>
          </button>
        </div>
      </div>
  );
}
