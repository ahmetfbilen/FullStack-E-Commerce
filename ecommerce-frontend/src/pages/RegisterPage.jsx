import React from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Doğru yolu kontrol edin

const RegisterPage = () => {
    const { register } = useAuth();
    const [name, setName] = React.useState('');
    const [lName, setLName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [pNumber, setPNumber] = React.useState('');
    const [bDate, setBDate] = React.useState('');
    const [message, setMessage] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const userData = {
            name,
            lName,
            email,
            password,
            pNumber: parseFloat(pNumber),
            bDate: new Date(bDate).toISOString(),
        };
        const success = await register(userData);
        if (success) {
            setMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        } else {
            setMessage('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
    };

    return (
        <div>
            <h2>Kayıt Ol</h2>
            <form onSubmit={handleSubmit}>
                <div><label>Ad:</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div><label>Soyad:</label><input type="text" value={lName} onChange={(e) => setLName(e.target.value)} required /></div>
                <div><label>Email:</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div><label>Şifre:</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <div><label>Telefon No:</label><input type="text" value={pNumber} onChange={(e) => setPNumber(e.target.value)} /></div>
                <div><label>Doğum Tarihi:</label><input type="date" value={bDate} onChange={(e) => setBDate(e.target.value)} /></div>
                <button type="submit">Kayıt Ol</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RegisterPage;