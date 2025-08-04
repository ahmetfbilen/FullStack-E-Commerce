import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext"; // Giriş yapmış kullanıcıyı alıyoruz

const BASE_URL = "http://localhost:5203";

export default function Cart() {
    const { user } = useAuth(); // Kullanıcı bilgisi
    const userId = user?.id;
    const [cart, setCart] = useState(null);

    // Sepeti sunucudan çeker
    const fetchCart = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/cart/user/${userId}`);
            setCart(res.data);
        } catch (err) {
            console.error("Sepet getirme hatası:", err);
        }
    };

    // Sayfa yüklendiğinde sepeti getir
    useEffect(() => {
        if (userId) {
            fetchCart();
        }
    }, [userId]);

    // Ürün silme fonksiyonu
    const removeItem = async (productId) => {
        await axios.delete(`${BASE_URL}/api/cart/remove`, {
            params: { userId, productId }
        });
        fetchCart();
    };

    // Adet artır/azalt fonksiyonu
    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        await axios.put(`${BASE_URL}/api/cart/update-quantity`, null, {
            params: { userId, productId, quantity: newQuantity }
        });
        fetchCart();
    };

    // Toplam fiyatı hesapla
    const total = cart?.cartItems.reduce((sum, item) => {
        return sum + item.product.price * item.quantiity;
    }, 0);

    if (!cart) return <p>Sepet boş veya yükleniyor...</p>;

    return (
        <div className="cart-container">
            <h2>🛒 Sepetim</h2>
            <ul>
                {cart.cartItems.map((item) => (
                    <li key={item.id} className="cart-item">
                        <strong>{item.product.name}</strong>
                        <p>
                            {item.product.price} ₺ × {item.quantiity} ={" "}
                            <strong>{(item.product.price * item.quantiity).toFixed(2)} ₺</strong>
                        </p>
                        <div className="cart-buttons">
                            <button onClick={() => updateQuantity(item.product.id, item.quantiity - 1)}>➖</button>
                            <button onClick={() => updateQuantity(item.product.id, item.quantiity + 1)}>➕</button>
                            <button onClick={() => removeItem(item.product.id)}>❌</button>
                        </div>
                    </li>
                ))}
            </ul>

            <hr />
            <h3>Toplam Tutar: {total.toFixed(2)} ₺</h3>
        </div>
    );
}
