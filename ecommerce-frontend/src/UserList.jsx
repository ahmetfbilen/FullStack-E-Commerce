import { useEffect, useState } from 'react';
import axios from 'axios';
import './Components/SellerProduct.css'; // Bu CSS dosyasının adını UserList.css olarak değiştirmeyi düşünebilirsiniz.

const BASE_URL = 'http://localhost:5203';

export default function UserList() {
    const [users, setUsers] = useState([]); // Kullanıcıları tutacak state

    const [form, setForm] = useState({
        name: '',
        lName: '', // Düzeltildi: lName
        email: '',
        pNumber: '', // Düzeltildi: pNumber
        bDate: ''    // Düzeltildi: bDate
    });

    useEffect(() => {
        fetchUsers();
    }, []); // Kullanıcıları çek

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/users`);
            setUsers(response.data); // Gelen veriyi users state'ine atıyoruz
        } catch (error) {
            console.error("Kullanıcılar çekilirken hata oluştu:", error);
        }
    };

    const addUser = async () => {
        await axios.post(`${BASE_URL}/api/users`, {
            name: form.name,
            lName: form.lName,     // Düzeltildi: lName
            email: form.email,
            pNumber: parseInt(form.pNumber), // Düzeltildi: pNumber
            bDate: form.bDate,     // Düzeltildi: bDate
        });
        // Ekledikten sonra form değerlerini boşalt
        setForm({ name: '', lName: '', email: '', pNumber: '', bDate: '' }); // Düzeltildi: lName, pNumber, bDate
        fetchUsers(); // Kullanıcı listesini yeniden çek
    };

    const deleteUser = async (id) => {
        await axios.delete(`${BASE_URL}/api/users/${id}`);
        fetchUsers(); // Kullanıcı listesini yeniden çek
    };

    const updateUser = async (id) => {
        const updatedName = prompt("Yeni Ad:", "");
        const updatedLName = prompt("Yeni Soyad:", "");
        const updatedEmail = prompt("Yeni Email:", "");
        const updatedPNumber = prompt("Yeni Telefon Numarası:", "");
        const updatedBDate = prompt("Yeni Doğum Tarihi (YYYY-MM-DD):", "");

        // Tüm alanların dolu olup olmadığını kontrol ediyoruz (bu kısım kaldırıldı, sadece düzeltme istendi)

        await axios.put(`${BASE_URL}/api/users/${id}`, {
            id: id, // PUT isteğinde ID'yi de göndermek genellikle iyi bir pratiktir
            name: updatedName,
            lName: updatedLName,
            email: updatedEmail,
            pNumber: parseInt(updatedPNumber), // Düzeltildi: parseFloat yerine parseInt
            bDate: updatedBDate
        });
        fetchUsers(); // Kullanıcı listesini yeniden çek
    };

    return (
        <div className="seller-container">
            <h1>Kullanıcı Paneli</h1>

            <div className="form">
                <input
                    placeholder="Ad"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    placeholder="Soyad"
                    value={form.lName}
                    onChange={(e) => setForm({ ...form, lName: e.target.value })} // Düzeltildi: lName
                />
                <input
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    placeholder="Telefon Numarası"
                    type="text"
                    value={form.pNumber}
                    onChange={(e) => setForm({ ...form, pNumber: e.target.value })} // Düzeltildi: pNumber
                />
                <input
                    placeholder="Doğum Tarihi"
                    type="date"
                    value={form.bDate}
                    onChange={(e) => setForm({ ...form, bDate: e.target.value })} // Düzeltildi: bDate
                />
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
                            <strong>Doğum Tarihi:</strong> {user.bDate}
                        </div>
                        <button onClick={() => updateUser(user.id)}> Düzenle</button>
                        <button onClick={() => deleteUser(user.id)}> Sil</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}