export const API_BASE_URL = "https://localhost:8443";

// Çerez okuma fonksiyonu
export function getCookie(name) {
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
}

// Header oluşturucu
const getHeaders = () => {
  const csrftoken = getCookie('csrftoken');
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken || '',
  };
};

// --- YENİ EKLENEN KISIM: CSRF TOKEN ALMA ---
// Eğer çerez yoksa, backend'e basit bir GET isteği atıp çerezi zorla alıyoruz.
const ensureCsrfToken = async () => {
  try {
    // Adresi 'csrf' olarak düzelttik ve GET isteği atıyoruz
    await fetch(`${API_BASE_URL}/api/v1/user/csrf/`, { 
      method: 'GET', 
      credentials: 'include' 
    });
    console.log("CSRF cookie requested successfully");
  } catch (err) {
    console.error("CSRF setup failed:", err);
  }
};

export const loginUser = async (username, password) => {
  const url = `${API_BASE_URL}/api/v1/user/login/`;

  // 1. Önce CSRF Çerezini Garantiye Al
  await ensureCsrfToken();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(), // Güncel çerezi header'a ekler
      body: JSON.stringify({ username, password }),
      credentials: 'include' // <--- BU ÇOK ÖNEMLİ (Çerezlerin taşınmasını sağlar)
    });

    const textData = await response.text();
    console.log("RAW SERVER RESPONSE:", textData);

    let data;
    try {
      data = JSON.parse(textData);
    } catch (err) {
      console.error("JSON Parse Error.");
      throw new Error("Sunucu hatası: Beklenmeyen yanıt döndü.");
    }

    if (!response.ok) {
      const errorMessage = data.detail || data.message || 'Login failed.';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const registerUser = async (username, email, password) => {
  const url = `${API_BASE_URL}/api/v1/user/signup/`;

  await ensureCsrfToken(); // Kayıt olurken de çerez lazım olabilir

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        username,
        password,
        email,
        avatar: null
      }),
      credentials: 'include' // Çerezler için
    });

    const data = await response.json();
    if (!response.ok) {
      let errorMsg = data.message;
      if (!errorMsg && typeof data === 'object')
        errorMsg = Object.values(data).flat().join(' ');
      throw new Error(errorMsg || 'Registration failed.');
    }
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// --- DİĞER FONKSİYONLAR (credentials: 'include' eklendi) ---

export const getFriends = async () => {
  const url = `${API_BASE_URL}/api/v1/user/friends/`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch friends list');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const removeFriend = async (friendId) => {
  const url = `${API_BASE_URL}/api/v1/user/friends/remove/`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ friend_id: friendId }),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to remove friend');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const addFriend = async (username) => {
  const url = `${API_BASE_URL}/api/v1/user/friends/add/`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username }),
      credentials: 'include'
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to add friend');
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const startGame = async (mode, difficulty) => {
  const url = `${API_BASE_URL}/api/play/start`;
  const difficultyMap = { 1: "Easy", 2: "Medium", 3: "Hard", 4: "Expert", 5: "Extreme" };
  const difficultyStr = difficultyMap[difficulty] || difficulty;
  
  // userId'yi localStorage'dan veya context'ten almak daha doğru olur
  // Şimdilik 1 olarak bıraktık
  const payload = { difficulty: difficultyStr, userId: 1 };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // CSRF gerekmeyebilir ama gerekirse getHeaders() kullan
      body: JSON.stringify(payload),
      credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Game start failed');
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const makeMove = async (gameId, row, col, value) => {
  const url = `${API_BASE_URL}/api/play/move`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ gameId, row, col, value }),
    credentials: 'include'
  });
  if (!response.ok) throw new Error('The move could not be sent');
  return await response.json();
};

export const getLeaderboard = async (mode = 'Total') => {
  const url = `${API_BASE_URL}/api/game/leaderboard/${mode}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
};

export const recordGameResult = async (userId, mode, isWin) => {
  const url = `${API_BASE_URL}/api/game/record-game`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, mode, result: isWin ? "win" : "lose" }),
      credentials: 'include'
    });
  } catch (error) {
    console.error("Score recording failed:", error);
  }
};

// Mock Functions (Bunları backend hazır olunca değiştirebilirsin)
export const getUserDetails = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        username: "User" + userId,
        email: "user@example.com",
        avatar: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200",
        bio: "42 Istanbul Student",
      });
    }, 300);
  });
};

export const getUserStats = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            totalGames: 0,
            winRate: "%0",
            ranks: { easy: "-", medium: "-", hard: "-", expert: "-", extreme: "-" }
        });
    }, 500); 
  });
};

export const logoutUser = async () => {
  const url = `${API_BASE_URL}/logout/`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      credentials: 'include'
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  }
};

export const createRoom = async (userId) => {
  const url = `${API_BASE_URL}/api/room/create`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to create room');
  return await response.json();
};

export const joinRoom = async (roomId, userId) => {
  const url = `${API_BASE_URL}/api/room/join/${roomId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
    credentials: 'include'
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to join room');
  }
  return await response.json();
};

export const deleteUserAccount = async () => {
  const url = `${API_BASE_URL}/api/user/profile/delete/`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      credentials: 'include'
    });
    return response.ok;
  } catch (error) {
    console.error("Delete failed:", error);
    return false;
  }
};

export const createCombatRoom = async (userId, level) => {
  const url = `${API_BASE_URL}/api/room/create`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        userId: userId.toString(), 
        level: level
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Oda oluşturulamadı');
    }

    return await response.json();
  } catch (error) {
    console.error("Combat Room Error:", error);
    throw error;
  }
};
