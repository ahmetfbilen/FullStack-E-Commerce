import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Doğru yolu kontrol edin

const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [message, setMessage] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const success = await login(email, password);
        if (success) {
            setMessage('Giriş başarılı!');
        } else {
            setMessage('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div>
            <h2>Giriş Yap</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Şifre:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Giriş Yap</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default LoginPage;