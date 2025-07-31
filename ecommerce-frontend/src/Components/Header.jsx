import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import logo from '../assets/logo1.png';
import { useAuth } from '../context/AuthContext.jsx';

const Header = () => {
    const { isAuthenticated, logout, isAdmin, isSeller } = useAuth();
    console.log(isAuthenticated, "isAuthenticated")
    console.log(isAdmin, "isAdmin")

    return (
        <header className="header">
            <div className="header-left">
                <img src={logo} alt="Logo" className="logo" />
            </div>
            <nav className="nav-links">
                <Link to="/" className="nav-button">Anasayfa</Link>

                {isAuthenticated ? (
                    <>
                        {(isAdmin || isSeller) && (
                            <Link to="/seller" className="nav-button2">Satıcı Paneli</Link>
                        )}
                        {isAdmin && (
                            <>
                                <Link to="/userlist" className="nav-button3">Kullanıcı Listesi</Link>
                                <Link to="/categories" className="nav-button">Kategori Yönetimi</Link> {/* <-- BU LİNKİ EKLEYİN */}
                            </>
                        )}
                        <button
                            onClick={logout}
                            className="nav-button"
                            style={{ marginLeft: '10px' }}
                        >
                            Çıkış Yap
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-button">Giriş Yap</Link>
                        <Link to="/register" className="nav-button">Kayıt Ol</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;