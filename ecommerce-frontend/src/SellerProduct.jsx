import { useEffect, useState } from 'react';
import axios from 'axios';
import './Components/SellerProduct.css';

const BASE_URL = 'http://localhost:5203';

export default function SellerProduct() {
    const [products, setProducts] = useState([]);//ürünleri tutacak
    const [form, setForm] = useState({ name: '', price: '', image: '' });//girilen bilgileri tutması için




    useEffect(() => {
        fetchProducts();
    }, []);//ürünleri çek




    const fetchProducts = async () => {
        const urun = await axios.get(`${BASE_URL}/api/products`);//gelen ürünleri urun'e atıyo
        setProducts(urun.data);//burda da productsa atıyo veriyi
    };

    const addProduct = async () => {
        await axios.post(`${BASE_URL}/api/products`, {
            name: form.name,
            price: parseFloat(form.price),
            image: form.image,
        });
        setForm({ name: '', price: '', image: '' });//ekledikten sonra boşalt girilen değerleri
        fetchProducts();
    };

    const deleteProduct = async (id) => {
        await axios.delete(`${BASE_URL}/api/products/${id}`);
        fetchProducts();
    };

    const updateProduct = async (id) => {
        const updatedName = prompt("Yeni ürün adı:", "");//promptla yeni bilgiyi al
        const updatedPrice = prompt("Yeni fiyat:", "");
        const updatedImage = prompt("Yeni görsel URL:", "");

        if (updatedName && updatedPrice && updatedImage) {
            await axios.put(`${BASE_URL}/api/products/${id}`, {
                name: updatedName,
                price: parseFloat(updatedPrice),
                image: updatedImage
            });
            fetchProducts();
        }
    };

    return (
        <div className="seller-container">
            <h1>Satıcı Paneli</h1>

            <div className="form">
                <input
                    placeholder="Ürün adı"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    placeholder="Fiyat"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <input
                    placeholder="Görsel URL"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                <button onClick={addProduct}>Ürün Ekle</button>
            </div>

            <ul className="product-list">
                {products.map((p) => (
                    <li key={p.id}>
                        <img src={p.image} alt={p.name} />
                        <div>
                            <strong>{p.name}</strong> – {p.price} ₺
                        </div>
                        <button onClick={() => updateProduct(p.id)}> Düzenle</button>
                        <button onClick={() => deleteProduct(p.id)}> Sil</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
