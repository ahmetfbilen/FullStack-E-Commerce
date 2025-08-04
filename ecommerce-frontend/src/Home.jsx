import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Header from './Components/Header';
import Footer from './Components/Footer';
import { useAuth } from './context/AuthContext'; // Giriş yapan kullanıcı bilgisi için

const BASE_URL = "http://localhost:5203";

function Home() {
    const [products, setProducts] = useState([]);
    const { isAuthenticated, user } = useAuth(); // Kullanıcı ve giriş durumu alınır

    // Ürünleri API'den çeken fonksiyon
    const getProduct = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/products`);
            setProducts(response.data);
        } catch (error) {
            console.error("Ürünler alınırken hata oluştu:", error);
        }
    };

    // Component yüklendiğinde ürünleri çek
    useEffect(() => {
        getProduct();
    }, []);

    // Sepete ürün ekleme fonksiyonu
    const addToCart = async (productId) => {
        if (!user || !user.id) {
            alert("Sepete eklemek için giriş yapmalısınız.");
            return;
        }

        try {
            await axios.post(`${BASE_URL}/api/cart/add?userId=${user.id}&productId=${productId}&quantity=1`);
            alert("Ürün sepete eklendi");
        } catch (error) {
            console.error("Sepete ekleme hatası:", error);
        }
    };

    return (
        <>
            <div className="container">
                <h1>Ürün Listesi</h1>
                <div className="grid">
                    {products.map((product) => (
                        <div className="card" key={product.id}>
                            <div className="card-content">
                                <img src={product.image} alt={product.name} className="product-image" />
                                <h2>{product.name}</h2>
                                <p className="price">{product.price.toFixed(2)} ₺</p>

                                {/* Sadece giriş yapan kullanıcı için gösterilir */}
                                {isAuthenticated && (
                                    <button
                                        className="add-to-cart-button"
                                        onClick={() => addToCart(product.id)}
                                    >
                                        Sepete Ekle
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Home;
