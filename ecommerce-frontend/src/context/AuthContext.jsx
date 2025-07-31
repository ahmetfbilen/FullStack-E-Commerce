import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true); // 1️⃣ Yeni: loading state'i eklendi

    const API_BASE_URL = 'http://localhost:5203/api'; // Doğru port numaranız

    const authAxios = axios.create({
        baseURL: API_BASE_URL,
    });

    // 2️⃣ Yeni: Axios Request Interceptor'ı eklendi
    // Bu interceptor, her istek gönderilmeden hemen önce çalışır ve token'ı dinamik olarak ekler.
    useEffect(() => {
        const requestInterceptor = authAxios.interceptors.request.use(
            (config) => {
                const currentToken = localStorage.getItem('token'); // Her istekte localStorage'dan token'ı al
                if (currentToken) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Cleanup fonksiyonu: Bileşen unmount edildiğinde interceptor'ı kaldır
        return () => {
            authAxios.interceptors.request.eject(requestInterceptor);
        };
    }, [authAxios]); // authAxios instance'ı değişirse interceptor'ı yeniden kur

    // 3️⃣ Mevcut useEffect'i sadece user state'ini ayarlamak için kullan
    // authAxios.defaults.headers.common['Authorization'] ayarı buradan kaldırıldı, interceptor yapıyor.
    useEffect(() => {
        console.log("AuthContext useEffect (token işleme) tetiklendi. Mevcut token:", token); // DEBUG 1
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                console.log("Çözümlenmiş Token (decodedToken):", decodedToken); // DEBUG 2

                const roleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
                const userRole = decodedToken[roleClaimType];
                console.log("Çekilen kullanıcı rolü (userRole):", userRole); // DEBUG 3

                const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                const userEmail = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

                const newUser = {
                    id: userId,
                    email: userEmail,
                    role: userRole,
                };
                setUser(newUser);
                console.log("User state ayarlandı:", newUser); // DEBUG 4

            } catch (error) {
                console.error("Token çözümleme hatası:", error);
                logout(); // Geçersiz token ise çıkış yap
            } finally {
                setLoading(false); // 4️⃣ Token işlendikten sonra loading'i false yap
            }
        } else {
            setUser(null);
            console.log("Token yok, user state null olarak ayarlandı."); // DEBUG 5
            setLoading(false); // 5️⃣ Token yoksa da loading'i false yap
        }
    }, [token]); // Sadece token değiştiğinde bu useEffect'i tetikle

    // Giriş fonksiyonu
    const login = async (email, password) => {
        setLoading(true); // 6️⃣ Giriş denemesi başladığında loading'i true yap
        try {
            const response = await axios.post(`${API_BASE_URL}/users/login`, { email, password });
            const newToken = response.data.token;
            setToken(newToken);
            localStorage.setItem('token', newToken);
            return true;
        } catch (error) {
            console.error("Giriş hatası:", error.response?.data || error.message);
            setLoading(false); // 7️⃣ Giriş başarısız olursa loading'i false yap
            return false;
        }
    };

    const register = async (userData) => {
        // Kayıt işlemi doğrudan giriş yapmadığı için loading'i etkilemez
        try {
            const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
            return true;
        } catch (error) {
            console.error("Kayıt hatası:", error.response?.data || error.message);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        setLoading(false); // 8️⃣ Çıkış yapıldığında loading'i false yap
    };

    const authContextValue = {
        user,
        token,
        login,
        register,
        logout,
        authAxios,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'Admin',
        isSeller: user?.role === 'Seller',
        loading, // 9️⃣ loading state'ini context'e ekle
    };

    console.log("AuthContextValue hesaplandı. user:", user, "isAdmin:", authContextValue.isAdmin, "loading:", loading); // DEBUG 6

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};