import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext"; // Giriş yapmış kullanıcıyı alıyoruz
import './Cart.css'; // CSS dosyanızı buraya import ettiğinizden emin olun!

const BASE_URL = "http://localhost:5203";

export default function Cart() {
    const { user } = useAuth(); // Kullanıcı bilgisi
    const userId = user?.id;
    const [cart, setCart] = useState(null);
    const [error, setError] = useState(null); // Hata mesajlarını tutmak için state

    // Sepeti sunucudan çeker
    const fetchCart = async () => {
        setError(null); // Yeni bir fetch öncesi hataları temizle
        try {
            const res = await axios.get(`${BASE_URL}/api/cart/user/${userId}`);
            setCart(res.data);
        } catch (err) {
            console.error("Sepet getirme hatası:", err);
            setError("Sepet yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
            setCart({ cartItems: [] }); // Hata durumunda sepeti boş göster
        }
    };

    // Sayfa yüklendiğinde sepeti getir
    useEffect(() => {
        if (userId) {
            fetchCart();
        } else {
            setCart({ cartItems: [] }); // Kullanıcı yoksa sepeti boş göster
            setError("Sepeti görüntülemek için giriş yapmalısınız."); // Kullanıcı yoksa hata mesajı
        }
    }, [userId]);

    // Ürün silme fonksiyonu
    const removeItem = async (productId) => {
        setError(null);
        try {
            await axios.delete(`${BASE_URL}/api/cart/remove`, {
                params: { userId, productId }
            });
            fetchCart(); // Sepeti yeniden çek
        } catch (err) {
            console.error("Ürün silme hatası:", err);
            setError("Ürün sepetten kaldırılırken bir hata oluştu.");
        }
    };

    // Adet artır/azalt fonksiyonu
    const updateQuantity = async (productId, newQuantity) => {
        setError(null);
        // newQuantity'nin sayı olduğundan emin olalım, NaN ise 0 olarak al
        const quantityToUpdate = parseFloat(newQuantity) || 0;

        if (quantityToUpdate < 1) {
            // Adet 0 veya altına düşerse ürünü sepetten kaldır
            removeItem(productId);
            return;
        }
        try {
            await axios.put(`${BASE_URL}/api/cart/update-quantity`, null, {
                params: { userId, productId, quantity: quantityToUpdate }
            });
            fetchCart(); // Sepeti yeniden çek
        } catch (err) {
            console.error("Adet güncelleme hatası:", err);
            setError("Ürün adedi güncellenirken bir hata oluştu.");
        }
    };

    // Toplam fiyatı hesapla
    const total = cart?.cartItems.reduce((sum, item) => {
        // Fiyat ve adedin sayı olduğundan emin olalım, NaN ise 0 olarak al
        const price = parseFloat(item.product.price) || 0;
        const quantity = parseFloat(item.quantiity) || 0; // Düzeltme: item.quantity -> item.quantiity

        return sum + (price * quantity);
    }, 0);

    // Sepet yüklenirken veya kullanıcı yokken
    if (!cart) {
        return <p className="loading-message">Sepetiniz yükleniyor...</p>;
    }

    return (
        <div className="cart-container">
            <h2>🛒 Sepetim</h2>

            {/* Hata mesajını burada göster */}
            {error && <div className="error-message">{error}</div>}

            {cart.cartItems.length === 0 ? (
                <div className="empty-cart-message">
                    <p>Sepetinizde henüz ürün bulunmamaktadır.</p>
                    <a href="/" className="continue-shopping-button">Alışverişe Devam Et</a>
                </div>
            ) : (
                <>
                    <ul className="cart-items-list">
                        {cart.cartItems.map((item) => {
                            // Her bir ürün için fiyat ve adedin sayı olduğundan emin olalım
                            const itemPrice = parseFloat(item.product.price) || 0;
                            const itemQuantity = parseFloat(item.quantiity) || 0; // Düzeltme: item.quantity -> item.quantiity

                            // Alt toplamı hesapla
                            const subtotal = (itemPrice * itemQuantity).toFixed(2);

                            return (
                                <li key={item.id} className="cart-item">
                                    {/* Ürün fotoğrafı için kapsayıcı div */}
                                    <div className="item-image-wrapper">
                                        <img
                                            src={item.product.image || "https://via.placeholder.com/80x80?text=No+Image"}
                                            alt={item.product.name}
                                        />
                                    </div>

                                    {/* Ürün adı ve fiyat bilgisi için kapsayıcı div */}
                                    <div className="item-info">
                                        <h3 className="item-name">{item.product.name}</h3>
                                        <p className="item-price">{itemPrice.toFixed(2)} ₺</p>
                                    </div>

                                    {/* Adet artırma/azaltma kontrolleri */}
                                    <div className="item-quantity-controls">
                                        <button
                                            onClick={() => updateQuantity(item.product.id, itemQuantity - 1)}
                                            className="quantity-button"
                                        >
                                            -
                                        </button>
                                        {/* Ürün adedini burada göster */}
                                        <span className="item-quantity">{itemQuantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, itemQuantity + 1)}
                                            className="quantity-button"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Ürün alt toplamı */}
                                    <div className="item-subtotal">
                                        <strong>{subtotal} ₺</strong>
                                    </div>

                                    {/* Ürünü sepetten kaldır butonu */}
                                    <div className="item-remove">
                                        <button
                                            onClick={() => removeItem(item.product.id)}
                                            className="remove-button"
                                        >
                                            Kaldır
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="cart-summary">
                        <div className="summary-total">
                            <h3>Toplam Tutar:</h3>
                            <span className="total-amount">{total.toFixed(2)} ₺</span>
                        </div>
                        <button className="checkout-button">Ödeme Yap</button>
                    </div>
                </>
            )}
        </div>
    );
}