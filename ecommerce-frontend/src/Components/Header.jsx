import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                🛒 <span>Ürün Mağazası</span>
            </div>
            <nav className="nav-links">
                <Link to="/" className="nav-button">Anasayfa</Link>
                <Link to="/seller" className="nav-button">Satıcı Paneli</Link>
            </nav>
        </header>
    );
};

export default Header;
