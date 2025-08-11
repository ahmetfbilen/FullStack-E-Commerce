import { useEffect, useState } from 'react';
import './Components/SellerProduct.css';
import { useAuth } from './context/AuthContext.jsx';

export default function ProductList() {
    const { authAxios, token, loading, isAuthenticated } = useAuth();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', image: '', categoryId: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Auth State:", { token, loading, isAuthenticated });
        if (token) {
            console.log("Token exists:", token.substring(0, 20) + "...");
        }
    }, [token, loading, isAuthenticated]);

    useEffect(() => {
        if (!loading && isAuthenticated) {
            fetchMyProducts();
            fetchCategories();
        } else if (!loading && !isAuthenticated) {
            setError("Bu sayfaya erişim için giriş yapmalısınız veya oturumunuz sona ermiş olabilir.");
            setProducts([]);
            setCategories([]);
        }
    }, [token, loading, isAuthenticated]);

    const fetchMyProducts = async () => {
        setError(null);
        try {
            const urun = await authAxios.get('/products/mine');
            setProducts(urun.data);
        } catch (error) {
            console.error("Ürünleri çekerken hata oluştu:", error.response?.data || error.message);
            setError("Ürünleri yüklerken bir hata oluştu. Lütfen giriş yaptığınızdan emin olun.");
        }
    };

    const fetchCategories = async () => {
        setError(null);
        try {
            const res = await authAxios.get('/categories');

            let data = [];

            if (res.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (Array.isArray(res.data)) {
                data = res.data;
            }

            const normalized = data.map((c, index) => ({
                id: c.id ?? c.Id ?? index,
                name: c.name ?? c.Name ?? "Kategori"
            }));

            setCategories(normalized);
        } catch (error) {
            console.error("Kategorileri çekerken hata oluştu:", error.response?.data || error.message);
            setError("Kategorileri yüklerken bir hata oluştu.");
            setCategories([]);
        }
    };

    const addProduct = async () => {
        setError(null);
        if (!isAuthenticated) {
            setError("Ürün eklemek için giriş yapmalısınız.");
            return;
        }

        const categoryOptions = Array.isArray(categories)
            ? categories.map(cat => `${cat.name} (ID: ${cat.id})`).join('\n')
            : '';

        const newCategoryIdInput = prompt(
            `Lütfen bir Kategori ID'si girin:\n\nMevcut Kategoriler:\n${categoryOptions}`,
            form.categoryId.toString()
        );

        const parsedCategoryId = parseInt(newCategoryIdInput);

        if (isNaN(parsedCategoryId) || !newCategoryIdInput) {
            alert("Geçersiz Kategori ID'si girdiniz veya işlemi iptal ettiniz.");
            return;
        }

        try {
            await authAxios.post('/products', {
                name: form.name,
                price: parseFloat(form.price),
                image: form.image,
                categoryId: parsedCategoryId
            });
            setForm({ name: '', price: '', image: '', categoryId: '' });
            fetchMyProducts();
        } catch (error) {
            console.error("Ürün eklerken hata oluştu:", error.response?.data || error.message);
            if (error.response && error.response.status === 401) {
                setError("Ürün ekleme yetkiniz yok. Lütfen giriş yaptığınızdan ve doğru yetkilere sahip olduğunuzdan emin olun.");
            } else {
                setError("Ürün eklenirken bir hata oluştu: " + (error.response?.data?.title || error.message));
            }
        }
    };

    const deleteProduct = async (id) => {
        setError(null);
        if (!isAuthenticated) {
            setError("Ürün silmek için giriş yapmalısınız.");
            return;
        }

        if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
            try {
                await authAxios.delete(`/products/${id}`);
                fetchMyProducts();
            } catch (error) {
                console.error("Ürün silerken hata oluştu:", error.response?.data || error.message);
                if (error.response && error.response.status === 401) {
                    setError("Ürün silme yetkiniz yok. Lütfen giriş yaptığınızdan ve doğru yetkilere sahip olduğunuzdan emin olun.");
                } else {
                    setError("Ürün silinirken bir hata oluştu: " + (error.response?.data?.title || error.message));
                }
            }
        }
    };

    const updateProduct = async (id) => {
        setError(null);
        if (!isAuthenticated) {
            setError("Ürün düzenlemek için giriş yapmalısınız.");
            return;
        }

        const currentProduct = products.find(p => p.id === id);
        if (!currentProduct) {
            alert("Ürün bulunamadı.");
            return;
        }

        const updatedName = prompt("Yeni ürün adı:", currentProduct.name);
        const updatedPrice = prompt("Yeni fiyat:", currentProduct.price.toString());
        const updatedImage = prompt("Yeni görsel URL:", currentProduct.image);

        const categoryOptions = Array.isArray(categories)
            ? categories.map(cat => `${cat.name} (ID: ${cat.id})`).join('\n')
            : '';
        const currentCategoryName = currentProduct.category ? currentProduct.category.name : 'Bilinmiyor';

        const updatedCategoryIdInput = prompt(
            `Yeni Kategori ID (Mevcut: ${currentCategoryName} - ID: ${currentProduct.categoryId}):\n\n` +
            `Mevcut Kategoriler:\n${categoryOptions}\n\n` +
            `Lütfen bir Kategori ID'si girin:`,
            currentProduct.categoryId.toString()
        );

        if (updatedName === null || updatedPrice === null || updatedImage === null || updatedCategoryIdInput === null) {
            alert("Ürün güncelleme iptal edildi.");
            return;
        }

        const parsedCategoryId = parseInt(updatedCategoryIdInput);
        if (isNaN(parsedCategoryId)) {
            alert("Geçersiz Kategori ID'si girdiniz. Lütfen bir sayı girin.");
            return;
        }

        try {
            await authAxios.put(`/products/${id}`, {
                name: updatedName,
                price: parseFloat(updatedPrice),
                image: updatedImage,
                categoryId: parsedCategoryId
            });
            fetchMyProducts();
        } catch (error) {
            console.error("Ürün güncellerken hata oluştu:", error.response?.data || error.message);
            if (error.response && error.response.status === 401) {
                setError("Ürün düzenleme yetkiniz yok. Lütfen giriş yaptığınızdan ve doğru yetkilere sahip olduğunuzdan emin olun.");
            } else {
                setError("Ürün güncellenirken bir hata oluştu: " + (error.response?.data?.title || error.message));
            }
        }
    };

    if (loading) {
        return <div className="loading-message">Ürünler yükleniyor...</div>;
    }

    return (
        <div className="seller-container">
            <h1>Satıcı Paneli</h1>

            {error && <div className="error-message">{error}</div>}

            {!isAuthenticated ? (
                <div className="auth-message">Bu sayfaya erişim için giriş yapmalısınız.</div>
            ) : (
                <>
                    <div className="form-section">
                        <h2>Yeni Ürün Ekle</h2>
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

                    <h2 className="product-list-title">Benim Ürünlerim</h2>
                    <ul className="product-list">
                        {products.length === 0 ? (
                            <li className="no-products-message">Henüz ürün bulunmamaktadır.</li>
                        ) : (
                            products.map((p) => (
                                <li key={p.id} className="product-item">
                                    <div className="product-image-wrapper">
                                        <img src={p.image || "https://via.placeholder.com/80x80?text=No+Image"} alt={p.name} />
                                    </div>
                                    <div className="product-details">
                                        <strong>{p.name}</strong> – {p.price.toFixed(2)} ₺
                                        {p.category && <span className="product-category"> ({p.category.name})</span>}
                                        {!p.category && <span className="product-category"> (Kategori Bilinmiyor)</span>}
                                    </div>
                                    <div className="product-actions">
                                        <button onClick={() => updateProduct(p.id)} className="action-button edit-button"> Düzenle</button>
                                        <button onClick={() => deleteProduct(p.id)} className="action-button delete-button"> Sil</button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </>
            )}
        </div>
    );
}