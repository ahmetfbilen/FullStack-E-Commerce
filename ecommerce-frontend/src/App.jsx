import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Mevcut bileşenleriniz
import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Home';
import SellerProduct from './SellerProduct';
import UserList from './UserList'; // UserList import'u
import CategoriesPage from './pages/CategoriesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Cart from './Cart.jsx';

// --- Korunan Rota Bileşeni ---
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // DEBUG LOGLARI: ProtectedRoute'a gelen değerleri kontrol edelim
  console.log("ProtectedRoute - loading:", loading);
  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute - user:", user);
  console.log("ProtectedRoute - user.role:", user?.role);
  console.log("ProtectedRoute - requiredRole:", requiredRole);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Kimlik doğrulanmadı, /login'e yönlendiriliyor.");
    return <Navigate to="/login" replace />;
  }

  // Rol kontrolü: Kullanıcının rolü, gerekli roller listesinde mi?
  if (requiredRole) {
    const rolesArray = requiredRole.split(',').map(role => role.trim());
    console.log("ProtectedRoute - Gerekli roller:", rolesArray);
    console.log("ProtectedRoute - Kullanıcı rolü gerekli rollerde mi?:", rolesArray.includes(user?.role));

    if (!rolesArray.includes(user?.role)) {
      console.log("ProtectedRoute: Rol yetersiz, /'e yönlendiriliyor.");
      return <Navigate to="/" replace />; // Ana sayfaya yönlendir
    }
  }

  console.log("ProtectedRoute: Erişim izni verildi.");
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
            <ProtectedRoute requiredRole="Seller,Admin"> {/* Seller veya Admin rolü gerektir */}
              <SellerProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userlist" // <-- BURAYI DÜZELTTİK: /userlist olarak kaldı
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