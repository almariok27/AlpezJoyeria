import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Página no encontrada</h2>
          <p className="not-found-text">
            Lo sentimos, la página que buscas no existe o ha sido eliminada.
          </p>
          <Link to="/" className="not-found-button">
            Volver al inicio
          </Link>
        </div>
        <div className="not-found-decoration">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#D8C08A" strokeWidth="2" opacity="0.3"/>
            <path d="M 30 50 Q 50 30 70 50" fill="none" stroke="#D8C08A" strokeWidth="2" opacity="0.3"/>
            <path d="M 30 50 Q 50 70 70 50" fill="none" stroke="#D8C08A" strokeWidth="2" opacity="0.3"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
