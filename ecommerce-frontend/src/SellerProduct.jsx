import { useEffect, useState } from 'react';
import './Components/SellerProduct.css';
import { useAuth } from './context/AuthContext.jsx';

export default function ProductList() {
    const { authAxios, token, loading, isAuthenticated } = useAuth(); // 1️⃣ token, loading, isAuthenticated'ı al

    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', image: '' });

    useEffect(() => {
        // 2️⃣ Sadece yükleme tamamlandığında ve kimlik doğrulama durumu bilindiğinde ürünleri çek
        if (!loading && isAuthenticated) { // Bu sayfa yetkilendirme gerektirdiği için isAuthenticated kontrolü ekledik
            fetchProducts();
        }
        // Eğer [AllowAnonymous] olsaydı, sadece !loading yeterli olurdu.
    }, [token, loading, isAuthenticated]); // 3️⃣ Bağımlılıkları token, loading, isAuthenticated olarak değiştir

    const fetchProducts = async () => {
        try {
            const urun = await authAxios.get('/products');
            setProducts(urun.data);
        } catch (error) {
            console.error("Ürünleri çekerken hata oluştu:", error.response?.data || error.message);
            // Hata yönetimi: Örneğin, 401/403 hatasında kullanıcıyı login sayfasına yönlendirme
        }
    };

    const addProduct = async () => {
        try {
            await authAxios.post('/products', {
                name: form.name,
                price: parseFloat(form.price),
                image: form.image,
                categoryId: 1 // Geçici olarak kategori ID'si atandı, daha sonra UI'dan seçilecek
            });
            setForm({ name: '', price: '', image: '' });
            fetchProducts();
        } catch (error) {
            console.error("Ürün eklerken hata oluştu:", error.response?.data || error.message);
        }
    };

    const deleteProduct = async (id) => {
        try {
            await authAxios.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error("Ürün silerken hata oluştu:", error.response?.data || error.message);
        }
    };

    const updateProduct = async (id) => {
        const updatedName = prompt("Yeni ürün adı:", "");
        const updatedPrice = prompt("Yeni fiyat:", "");
        const updatedImage = prompt("Yeni görsel URL:", "");
        const updatedCategoryId = prompt("Yeni Kategori ID:", "1"); // Geçici olarak kategori ID'si al

        if (updatedName && updatedPrice && updatedImage && updatedCategoryId) {
            try {
                await authAxios.put(`/products/${id}`, {
                    name: updatedName,
                    price: parseFloat(updatedPrice),
                    image: updatedImage,
                    categoryId: parseInt(updatedCategoryId)
                });
                fetchProducts();
            } catch (error) {
                console.error("Ürün güncellerken hata oluştu:", error.response?.data || error.message);
            }
        }
    };

    // 4️⃣ Yükleme durumunu veya yetkilendirme durumunu göster
    if (loading) {
        return <div>Ürünler yükleniyor...</div>;
    }
    if (!isAuthenticated) { // Bu sayfa ProtectedRoute ile korunuyor ama yine de bir fallback
        return <div>Bu sayfaya erişim için giriş yapmalısınız.</div>;
    }

    return (
        <div className="seller-container">
            <h1>Satıcı Paneli</h1>
            {/* ... (form ve liste içeriği) ... */}
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
                            {p.category && <span> ({p.category.name})</span>} {/* Kategori adını göster */}
                        </div>
                        <button onClick={() => updateProduct(p.id)}> Düzenle</button>
                        <button onClick={() => deleteProduct(p.id)}> Sil</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}