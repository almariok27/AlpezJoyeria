import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '../../hooks/useToast';
import AdminMenu from '../AdminMenu/AdminMenu';
import './Header.css';

export default function Header() {
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [mostrarConfirmLogout, setMostrarConfirmLogout] = useState(false);
    const [cerrando, setCerrando] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    const isAdminPage = location.pathname === '/admin';

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogoutClick = () => {
        setMostrarConfirmLogout(true);
    };

    const confirmarLogout = async () => {
        setCerrando(true);
        try {
            await signOut(auth);
            navigate('/');
            toast.success('Sesión cerrada correctamente');
        } catch (error) {
            toast.error('Error al cerrar sesión');
            console.log(error);
        } finally {
            setCerrando(false);
            setMostrarConfirmLogout(false);
        }
    };

    const cancelarLogout = () => {
        setMostrarConfirmLogout(false);
    };

    const logoLink = isAdminPage ? '/admin' : '/';

    return (
        <header className="header">
            {/* Logo - Link inteligente según la página */}
            <Link to={logoLink} className="logo-contenedor" style={{ textDecoration: 'none' }}>
                <img
                    src="/img/Alpez Horizontal.svg"
                    alt="Logo de Joyería Alpez"
                    className="logo"
                />
            </Link>

            {/* MENÚ HAMBURGUESA EN MOBILE (Solo visible en móvil) */}
            {isAdminPage && (
                <div className="header-admin-menu-mobile">
                    <AdminMenu />
                </div>
            )}

            {/* Usuario/Logout a la derecha */}
            <div className="header-right">
                {user ? (
                    <button className="logout-btn" onClick={handleLogoutClick}>
                        <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Cerrar Sesión</span>
                    </button>
                ) : (
                    <Link to="/login" className="user-icon-link">
                        <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </Link>
                )}
            </div>

            {/* MODAL DE CONFIRMACIÓN DE LOGOUT */}
            {mostrarConfirmLogout && (
                <div className="modal-overlay" onClick={cancelarLogout}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Cerrar Sesión</h2>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro de que deseas cerrar sesión?</p>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="modal-btn-cancel" 
                                onClick={cancelarLogout}
                                disabled={cerrando}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="modal-btn-confirm" 
                                onClick={confirmarLogout}
                                disabled={cerrando}
                            >
                                {cerrando ? 'Cerrando...' : 'Cerrar Sesión'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}