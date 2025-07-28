import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import logo from '../assets/logo1.png';

const Header = () => {
    return (
        <header className="header">
            <div className="header-left">
                <img src={logo} alt="Logo" className="logo" />
            </div>
            <nav className="nav-links">
                <Link to="/" className="nav-button">Anasayfa</Link>
                <Link to="/seller" className="nav-button2">Satıcı Paneli</Link>
                <Link to="/user" className="nav-button3">Kullanıcı Listesi</Link>
            </nav>
        </header>
    );
};

export default Header;
