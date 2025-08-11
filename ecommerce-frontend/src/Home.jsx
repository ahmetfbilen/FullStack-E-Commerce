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

    // 🔹 Kategorileri tut
    const [categories, setCategories] = useState([]);

    // 🔹 Filtre state'leri (arama metni + seçilen kategori)
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");

    // Ürünleri API'den çeken fonksiyon
    const getProduct = async () => {
        try {
            // 🔹 Query paramlarını basitçe hazırla
            const params = {};
            if (search.trim() !== "") params.q = search.trim();   // arama
            if (categoryId) params.categoryId = categoryId;       // kategori

            const response = await axios.get(`${BASE_URL}/api/products`, { params });
            setProducts(response.data);
        } catch (error) {
            console.error("Ürünler alınırken hata oluştu:", error);
        }
    };

    // 🔹 Kategorileri çek
    const getCategories = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/categories`);
            console.log("Kategoriler API cevabı:", res.data);

            let data = [];

            if (res.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (Array.isArray(res.data)) {
                data = res.data;
            }
            console.log("Kategoriler:", categories);

            // Id → id, Name → name dönüştürme
            const normalized = data.map(c => ({
                id: c.id ?? c.Id,       // hem küçük hem büyük harfi kontrol et
                name: c.name ?? c.Name  // hem küçük hem büyük harfi kontrol et
            }));

            console.log("Normalize edilmiş kategoriler:", normalized);

            setCategories(normalized);
        } catch (error) {
            console.error("Kategoriler alınırken hata oluştu:", error);
            setCategories([]);
        }
    };//REDİS eklediğimiz için değiştirdik

    // Component yüklendiğinde ürünleri çek
    useEffect(() => {
        getCategories();   // 🔹 önce kategori listesini çek
        getProduct();      // 🔹 başlangıçta tüm ürünleri getir
    }, []);

    // 🔹 Arama veya kategori değişince ürünleri tekrar çek
    useEffect(() => {
        getProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, categoryId]);

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

                {/* 🔹 Basit Filtre Barı */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 120px', gap: 8, marginBottom: 16 }}>
                    {/* 🔹 Arama kutusu (yazdıkça state güncellenir) */}
                    <input
                        type="text"
                        placeholder="Ara (örn. iPhone)…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
                    />

                    {/* 🔹 Kategori seçimi (boş = tümü) */}
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
                    >
                        <option value="">Tüm Kategoriler</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* 🔹 Temizle butonu: filtreleri sıfırla */}
                    <button
                        onClick={() => { setSearch(""); setCategoryId(""); }}
                        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer' }}
                    >
                        Temizle
                    </button>
                </div>

                <div className="grid">
                    {products.map((product) => (
                        <div className="card" key={product.id}>
                            <div className="card-content">
                                <img
                                    src={product.image || ''}
                                    alt={product.name}
                                    className="product-image"
                                />
                                <h2>{product.name}</h2>
                                <p className="price">
                                    {/* 🔹 price number değilse toFixed patlamasın */}
                                    {typeof product.price === 'number'
                                        ? product.price.toFixed(2)
                                        : product.price} ₺
                                </p>

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

                {/* 🔹 Ürün yoksa bilgi mesajı */}
                {products.length === 0 && (
                    <div style={{ marginTop: 12, color: '#888' }}>Kriterlere uygun ürün bulunamadı.</div>
                )}
            </div>
        </>
    );
}

export default Home;
