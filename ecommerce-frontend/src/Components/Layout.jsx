// src/components/Layout.js
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </>
    );
};


export default Layout;
