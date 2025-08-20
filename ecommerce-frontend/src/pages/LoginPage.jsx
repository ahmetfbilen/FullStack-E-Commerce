// LoginPage.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Doğru yolu kontrol edin
import './LoginPage.css'; // CSS dosyasını import ediyoruz

const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [isError, setIsError] = React.useState(false); // Mesajın tipini belirlemek için

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false); // Her denemede sıfırla

        const success = await login(email, password);
        if (success) {
            setMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
            setIsError(false);
            // Başarılı girişte Navigate bileşeni otomatik yönlendirecektir.
        } else {
            setMessage('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            setIsError(true); // Hata durumunu işaretle
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-heading">Giriş Yap</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="login-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Şifre:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="login-input"
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Giriş Yap
                    </button>
                </form>
                {message && (
                    <p className={`login-message ${isError ? 'error-message' : 'success-message'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoginPage;