// RegisterPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Doğru yolu kontrol edin
import './RegisterPage.css'; // CSS dosyasını import ediyoruz

const RegisterPage = () => {
    const { register } = useAuth();
    const [name, setName] = React.useState('');
    const [lName, setLName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [pNumber, setPNumber] = React.useState('');
    const [bDate, setBDate] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [isError, setIsError] = React.useState(false); // Mesajın tipini belirlemek için

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Her denemede mesajı sıfırla
        setIsError(false); // Her denemede hata durumunu sıfırla

        // Telefon numarasını ve doğum tarihini göndermeden önce kontrol et
        let parsedPNumber = null;
        if (pNumber.trim() !== '') {
            const num = parseFloat(pNumber);
            if (isNaN(num)) {
                setMessage('Telefon numarası geçerli bir sayı olmalıdır.');
                setIsError(true);
                return;
            }
            parsedPNumber = num;
        }

        let isoBDate = null;
        if (bDate.trim() !== '') {
            try {
                isoBDate = new Date(bDate).toISOString();
            } catch (error) {
                setMessage('Doğum tarihi geçerli bir formatta olmalıdır.');
                setIsError(true);
                return;
            }
        }

        const userData = {
            name,
            lName,
            email,
            password,
            pNumber: parsedPNumber, // Null veya sayı olarak gönder
            bDate: isoBDate, // Null veya ISO string olarak gönder
        };

        const success = await register(userData);
        if (success) {
            setMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
            setIsError(false);
            // İsteğe bağlı: Kayıt başarılı olduktan sonra formu temizle
            setName('');
            setLName('');
            setEmail('');
            setPassword('');
            setPNumber('');
            setBDate('');
        } else {
            setMessage('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin veya bu email zaten kullanılıyor olabilir.');
            setIsError(true);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2 className="register-heading">Kayıt Ol</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name" className="register-label">Ad:</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="register-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lName" className="register-label">Soyad:</label>
                        <input type="text" id="lName" value={lName} onChange={(e) => setLName(e.target.value)} required className="register-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="register-label">Email:</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="register-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="register-label">Şifre:</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="register-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pNumber" className="register-label">Telefon No:</label>
                        <input type="text" id="pNumber" value={pNumber} onChange={(e) => setPNumber(e.target.value)} className="register-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bDate" className="register-label">Doğum Tarihi:</label>
                        <input type="date" id="bDate" value={bDate} onChange={(e) => setBDate(e.target.value)} className="register-input" />
                    </div>
                    <button type="submit" className="register-button">Kayıt Ol</button>
                </form>
                {message && (
                    <p className={`status-message ${isError ? 'error-message' : 'success-message'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;