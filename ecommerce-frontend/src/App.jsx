import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Mevcut bileşenleriniz
import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Home';
import SellerProduct from './SellerProduct';
import UserList from './UserList';
import CategoriesPage from './pages/CategoriesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Cart from './Cart.jsx';

// Chatbot import
import Chatbot from './Components/Chatbot';

// --- Korunan Rota Bileşeni ---
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const rolesArray = requiredRole.split(',').map(role => role.trim());
    if (!rolesArray.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// --- Ana App Bileşeni ---
function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Uygulama Yükleniyor... Lütfen Bekleyin.</div>;
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<Cart />} />

        {/* Korunan Rotalar */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute requiredRole="Seller,Admin">
              <SellerProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userlist"
          element={
            <ProtectedRoute requiredRole="Admin">
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute requiredRole="Admin">
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>404 - Sayfa Bulunamadı</div>} />
      </Routes>
      <Footer />

      {/* Chatbot her sayfada görünsün */}
      <Chatbot />
    </Router>
  );
}

// --- AuthProvider ile App bileşenini sarmala ---
function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;