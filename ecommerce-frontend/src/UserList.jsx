import { useEffect, useState } from 'react';
import './Components/SellerProduct.css'; // CSS dosyasını UserList.css olarak değiştirmeyi düşünebilirsiniz.
import { useAuth } from './context/AuthContext.jsx';

export default function UserList() {
    const { authAxios, token, loading, isAuthenticated } = useAuth(); // 1️⃣ token, loading, isAuthenticated'ı al

    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        name: '', lName: '', email: '', password: '', pNumber: '', bDate: ''
    });

    useEffect(() => {
        // 2️⃣ Sadece yükleme tamamlandığında ve kimlik doğrulama durumu bilindiğinde kullanıcıları çek
        if (!loading && isAuthenticated) { // Bu sayfa yetkilendirme gerektirdiği için isAuthenticated kontrolü ekledik
            fetchUsers();
        }
    }, [token, loading, isAuthenticated]); // 3️⃣ Bağımlılıkları token, loading, isAuthenticated olarak değiştir

    const fetchUsers = async () => {
        try {
            const response = await authAxios.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Kullanıcılar çekilirken hata oluştu:", error.response?.data || error.message);
        }
    };

    const addUser = async () => {
        try {
            await authAxios.post('/users/register', {
                name: form.name, lName: form.lName, email: form.email, password: form.password,
                pNumber: parseFloat(form.pNumber), bDate: new Date(form.bDate).toISOString(),
            });
            setForm({ name: '', lName: '', email: '', password: '', pNumber: '', bDate: '' });
            fetchUsers();
        } catch (error) {
            console.error("Kullanıcı eklerken hata oluştu:", error.response?.data || error.message);
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
            try {
                await authAxios.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Kullanıcı silerken hata oluştu:", error.response?.data || error.message);
            }
        }
    };

    const updateUser = async (id) => {
        const updatedName = prompt("Yeni Ad:", "");
        const updatedLName = prompt("Yeni Soyad:", "");
        const updatedEmail = prompt("Yeni Email:", "");
        const updatedPNumber = prompt("Yeni Telefon Numarası:", "");
        const updatedBDate = prompt("Yeni Doğum Tarihi (YYYY-MM-DD):", "");
        const updatedRole = prompt("Yeni Rol (User, Seller, Admin):", "");

        if (updatedName && updatedLName && updatedEmail && updatedPNumber && updatedBDate && updatedRole) {
            try {
                await authAxios.put(`/users/${id}`, {
                    id: id, name: updatedName, lName: updatedLName, email: updatedEmail,
                    pNumber: parseFloat(updatedPNumber), bDate: new Date(updatedBDate).toISOString(),
                    role: updatedRole
                });
                fetchUsers();
            } catch (error) {
                console.error("Kullanıcı güncellerken hata oluştu:", error.response?.data || error.message);
            }
        }
    };

    // 4️⃣ Yükleme durumunu veya yetkilendirme durumunu göster
    if (loading) {
        return <div>Kullanıcılar yükleniyor...</div>;
    }
    if (!isAuthenticated) {
        return <div>Bu sayfaya erişim için giriş yapmalısınız.</div>;
    }

    return (
        <div className="seller-container">
            <h1>Kullanıcı Paneli</h1>
            {/* ... (form ve liste içeriği) ... */}
            <div className="form">
                <input placeholder="Ad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input placeholder="Soyad" value={form.lName} onChange={(e) => setForm({ ...form, lName: e.target.value })} />
                <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input placeholder="Şifre" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <input placeholder="Telefon Numarası" type="text" value={form.pNumber} onChange={(e) => setForm({ ...form, pNumber: e.target.value })} />
                <input placeholder="Doğum Tarihi" type="date" value={form.bDate} onChange={(e) => setForm({ ...form, bDate: e.target.value })} />
                <button onClick={addUser}>Kullanıcı Ekle</button>
            </div>

            <ul className="product-list">
                {users.map((user) => (
                    <li key={user.id}>
                        <div>
                            <strong>Ad:</strong> {user.name} <br />
                            <strong>Soyad:</strong> {user.lName} <br />
                            <strong>Email:</strong> {user.email} <br />
                            <strong>Telefon:</strong> {user.pNumber} <br />
                            <strong>Doğum Tarihi:</strong> {user.bDate} <br />
                            <strong>Rol:</strong> {user.role}
                        </div>
                        <button onClick={() => updateUser(user.id)}> Düzenle</button>
                        <button onClick={() => deleteUser(user.id)}> Sil</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}