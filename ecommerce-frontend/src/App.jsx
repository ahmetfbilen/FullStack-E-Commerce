import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Header from './Components/Header';
import Footer from './Components/Footer';

const BASE_URL = ""; // Burayı doldurmayı unutma

function App() {
  const [products, setProducts] = useState([]);

  const getProduct = async () => {
    try {
      const response = await axios.get(BASE_URL + "/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Veri alınamadı:", error);
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <>
      <Header />

      <div className="container">
        <h1>Ürün Listesi</h1>

        <div className="grid">
          {products.map((product) => (
            <div className="card" key={product.id}>
              <div className="card-content">
                <h2>{product.name}</h2>
                <p className="price">{product.price.toFixed(2)} ₺</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default App;
