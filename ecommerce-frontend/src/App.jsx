import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Home';
import SellerProduct from './SellerProduct';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} /> {/* ← Ekledik */}
        <Route path="/seller" element={<SellerProduct />} />
        <Route path="*" element={<div>404 - Sayfa Bulunamadı</div>} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
