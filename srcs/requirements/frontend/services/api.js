export const API_BASE_URL = "https://localhost:8443"; 

export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '')
  {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++)
    {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '='))
      {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


const getHeaders = () => {
  const csrftoken = getCookie('csrftoken');
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken || '',
  };
};

export const loginUser = async (username, password) => {
  const url = `${API_BASE_URL}/api/v1/user/login/`; 

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });

    const textData = await response.text();
    
    console.log("RAW SERVER RESPONSE:", textData);

    let data;
    try
    {
      data = JSON.parse(textData);
    }
    catch (err)
    {
      console.error("JSON Parse Error. Server may have sent HTML.");
      throw new Error("Server error: Returned unexpected response (Probably 404 or 500 HTML page).");
    }

    if (!response.ok)
    {
       const errorMessage = data.detail || data.message || 'Login failed.';
       throw new Error(errorMessage);
    }
    
    return data;
  }
  catch (error)
  {
    console.error("Login Error:", error);
    throw error;
  }
};

export const registerUser = async (username, email, password) => {
  const url = `${API_BASE_URL}/api/v1/user/signup/`;

  try
  {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        username,
        password,
        email,
        avatar: null
      }),
    });

    const data = await response.json();
    if (!response.ok)
    {
      let errorMsg = data.message;

      if (!errorMsg && typeof data === 'object')
        errorMsg = Object.values(data).flat().join(' ');

      throw new Error(errorMsg || 'Registration failed (Unknown Error).');
    }
    return data;
  }
  catch (error)
  {
    console.error("API Error:", error);
    throw error;
  }
};


export const startGame = async (mode, difficulty) => {
  const url = `${API_BASE_URL}/api/play/start`;

  const difficultyMap = {
    1: "Easy",
    2: "Medium",
    3: "Hard",
    4: "Expert",
    5: "Extreme"
  };

  const difficultyStr = difficultyMap[difficulty] || difficulty;

  const payload = {
    difficulty: difficultyStr,
    userId: 1
  };

  console.log("Sending Payload:", payload); 

  try
  {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok)
    {
      const errorData = await response.json();
      console.error("Backend Error:", errorData);
      throw new Error(errorData.detail || 'Game start failed');
    }

    return await response.json();
  }
  catch (error)
  {
    console.error("API Error:", error);
    throw error;
  }
};

export const makeMove = async (gameId, row, col, value) => {
  const url = `${API_BASE_URL}/api/game/move`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ gameId, row, col, value }),
  });

  if (!response.ok)
    throw new Error('The move could not be sent');
  return await response.json();
};

export const getLeaderboard = async (mode = 'Total') => {
  const url = `${API_BASE_URL}/api/game/leaderboard/${mode}`;

  try
  {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' } 
    });
    
    if (!response.ok)
    {
      console.error("Leaderboard fetch failed:", response.status);
      return [];
    }
    return await response.json();
  }
  catch (error)
  {
    console.error("Leaderboard network error:", error);
    return [];
  }
};

export const recordGameResult = async (userId, mode, isWin) => {
  const url = `${API_BASE_URL}/api/game/record-game`;

  try
  {
    await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        userId, 
        mode, 
        result: isWin ? "win" : "lose"
      }),
    });
  } catch (error) {
    console.error("Score recording failed:", error);
  }
};


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

export const createRoom = async (userId) => {
  const url = `${API_BASE_URL}/api/combat/room/create`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });

  if (!response.ok)
    throw new Error('Failed to create room');
  return await response.json();
};

export const joinRoom = async (roomId, userId) => {
  const url = `${API_BASE_URL}/api/combat/room/join/${roomId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });

  if (!response.ok)
  {
    const err = await response.json();
    throw new Error(err.message || 'Failed to join room');
  }
  return await response.json();
};

export const logoutUser = async () => {
  const url = `${API_BASE_URL}/logout/`;

  try
  {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
    });
  }
  catch (error)
  {
    console.error("Logout request failed:", error);
  }
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

export const deleteUserAccount = async () => {
  const url = `${API_BASE_URL}/api/user/profile/delete/`;

  try
  {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
    });

    if (response.ok)
      return true;
    else
    {
      console.error("Delete failed");
      return false;
    }
  }
  catch (error)
  {
    console.error("Network error during deletion:", error);
    return false;
  }
};