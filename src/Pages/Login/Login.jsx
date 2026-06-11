import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import './Login.css';
import { useNavigate} from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

export default function Login() {

    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const iniciarSesion = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('¡Bienvenido Admin!');
            navigate('/admin');
        } catch (error) {
            toast.error('Error al iniciar sesión. Verifica tus credenciales.');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-header">
                    <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <h1>Acceso</h1>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={iniciarSesion} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>¿Olvidaste tu contraseña? <a href="#help">Solicitar acceso</a></p>
                </div>
            </div>

            <div className="decoration decoration-1"></div>
            <div className="decoration decoration-2"></div>
        </div>
    );
}