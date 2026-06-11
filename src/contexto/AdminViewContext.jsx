import { createContext, useState, useEffect } from 'react';

export const AdminViewContext = createContext();

export function AdminViewProvider({ children }) {
  const [activeView, setActiveView] = useState(() => {
    const savedView = localStorage.getItem('adminActiveView');
    return savedView || 'inventario';
  });

  useEffect(() => {
    localStorage.setItem('adminActiveView', activeView);
  }, [activeView]);

  return (
    <AdminViewContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </AdminViewContext.Provider>
  );
}
