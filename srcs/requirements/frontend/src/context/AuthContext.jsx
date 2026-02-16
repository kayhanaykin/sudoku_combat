import React, { createContext, useState, useEffect, useContext } from 'react';
// Eğer api.js dosyan varsa oradan import edebilirsin, yoksa aşağıda fetch kullanıyoruz.
import { API_BASE_URL } from '../../services/api'; // api.js yolunu kontrol et

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklenince localStorage'dan kullanıcıyı geri getir
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      // 1. Backend'e çıkış isteği gönder (Çerezleri silmesi ve offline yapması için)
      // Not: API_BASE_URL tanımlı değilse direkt 'https://localhost:8443' yazabilirsin
      await fetch(`https://localhost:8443/api/v1/user/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // CSRF token eklemek iyi olur ama cookie based auth'da credentials: include yeterli olabilir
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      // 2. Cevap ne olursa olsun Frontend temizliği yap
      localStorage.removeItem('user');
      setUser(null);
      // Ana sayfaya yönlendir (Opsiyonel)
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);