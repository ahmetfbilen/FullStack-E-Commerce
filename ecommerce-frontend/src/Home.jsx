import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Header from './Components/Header';
import Footer from './Components/Footer';

const BASE_URL = "http://localhost:5203";

function Home() {
    const [products, setProducts] = useState([]);

    const getProduct = async () => {
        const response = await axios.get(BASE_URL + "/api/products");
        setProducts(response.data);
    };

    useEffect(() => {
        getProduct();
    }, []);

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
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </>
    );
}

export default Home;
