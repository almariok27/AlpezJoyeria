import { useContext } from 'react';
import { ToastContext } from '../../contexto/ToastContext';
import './Toast.css';

export default function Toast() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ℹ'}
            </span>
            <p className="toast-message">{toast.message}</p>
          </div>
          <button 
            className="toast-close" 
            onClick={() => removeToast(toast.id)}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
