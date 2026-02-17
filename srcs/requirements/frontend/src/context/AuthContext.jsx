import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Sayfa Yüklendiğinde Kimlik Kontrolü (Check Auth)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Backend'e "Benim geçerli bir çerezim var mı?" diye soruyoruz
        const response = await fetch(`https://localhost:8443/api/v1/user/me/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // ÖNEMLİ: Çerezleri (sessionid, token) gönderir
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // İsteğe bağlı: Yedek olarak localStorage'a da koyabilirsin
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Çerez geçersizse veya yoksa temizle
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

const logout = async () => {
    try {
      // 1. Çerezlerden csrftoken'ı bulma fonksiyonu
      const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
            }
          }
        }
        return cookieValue;
      };

      const csrfToken = getCookie('csrftoken');

      // 2. Logout isteği
      await fetch(`https://localhost:8443/api/v1/user/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // Django'nun beklediği güvenlik anahtarı
        },
        credentials: 'include', // Çerezleri (sessionid) backend'e iletir
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 3. Backend ne derse desin frontend'i temizle ve ana sayfaya at
      localStorage.removeItem('user');
      setUser(null);
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