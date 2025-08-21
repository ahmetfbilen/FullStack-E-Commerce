import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './CategoriesPage.css';

export default function CategoriesPage() {
    const { authAxios, isAdmin, token, loading, isAuthenticated } = useAuth(); // 1️⃣ token, loading, isAuthenticated'ı al
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editedCategoryName, setEditedCategoryName] = useState('');

    useEffect(() => {
        // 2️⃣ Sadece yükleme tamamlandığında ve Admin ise kategorileri çek
        if (!loading && isAdmin) { // Bu sayfa Admin rolü gerektirdiği için isAdmin kontrolü ekledik
            fetchCategories();
        }
    }, [token, loading, isAdmin, authAxios]); // 3️⃣ Bağımlılıkları token, loading, isAdmin, authAxios olarak değiştir

    const fetchCategories = async () => {
        try {
            const response = await authAxios.get('/categories');
            console.log("Kategoriler API cevabı:", response.data);

            // Eğer response.data bir array değilse, uygun alanı al
            if (Array.isArray(response.data)) {
                setCategories(response.data);
            }
            else if (Array.isArray(response.data.categories)) {
                setCategories(response.data.categories);
            }
            else if (Array.isArray(response.data.data)) {
                setCategories(response.data.data);
            }
            else {
                setCategories([]); // güvenlik için boş array
            }
        } catch (error) {
            console.error("Kategoriler çekilirken hata oluştu:", error.response?.data || error.message);
            setCategories([]); // hata olursa null yerine boş array
        }
    };

    const addCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await authAxios.post('/categories', { name: newCategoryName });
            setNewCategoryName('');
            fetchCategories();
        } catch (error) {
            console.error("Kategori eklerken hata oluştu:", error.response?.data || error.message);
        }
    };

    const deleteCategory = async (id) => {
        if (window.confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
            try {
                await authAxios.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error("Kategori silerken hata oluştu:", error.response?.data || error.message);
                alert("Kategori silinirken bir hata oluştu. Bağlı ürünler olabilir.");
            }
        }
    };

    const startEditing = (category) => {
        setEditingCategory(category);
        setEditedCategoryName(category.name);
    };

    const cancelEditing = () => {
        setEditingCategory(null);
        setEditedCategoryName('');
    };

    const updateCategory = async () => {
        if (!editedCategoryName.trim() || !editingCategory) return;
        try {
            await authAxios.put(`/categories/${editingCategory.id}`, {
                id: editingCategory.id,
                name: editedCategoryName
            });
            cancelEditing();
            fetchCategories();
        } catch (error) {
            console.error("Kategori güncellerken hata oluştu:", error.response?.data || error.message);
        }
    };

    // 4️⃣ Yükleme durumunu veya yetkilendirme durumunu göster
    if (loading) {
        return <div>Kategoriler yükleniyor...</div>;
    }
    if (!isAdmin) { // Bu sayfa ProtectedRoute ile korunuyor ama yine de bir fallback
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
    }

    return (
        <div className="categories-container">
            <h1>Kategori Yönetimi</h1>

            <div className="add-category-form">
                <input
                    type="text"
                    placeholder="Yeni kategori adı"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button onClick={addCategory}>Kategori Ekle</button>
            </div>

            <ul className="category-list">
                {categories.map((category) => (
                    <li key={category.id}>
                        {editingCategory && editingCategory.id === category.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editedCategoryName}
                                    onChange={(e) => setEditedCategoryName(e.target.value)}
                                />
                                <button onClick={updateCategory}>Kaydet</button>
                                <button onClick={cancelEditing}>İptal</button>
                            </>
                        ) : (
                            <>
                                <span>{category.name}</span>
                                <button onClick={() => startEditing(category)}>Düzenle</button>
                                <button onClick={() => deleteCategory(category.id)}>Sil</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}