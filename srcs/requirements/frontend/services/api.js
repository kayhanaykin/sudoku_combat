export const loginUser = async (username, password) => {
  const response = await fetch('/api/users/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const text = await response.text();
  console.log("SERVER'DAN GELEN HAM YANIT:", text);

  try {
    const data = JSON.parse(text);
    
    if (!response.ok)
    {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  }
  catch (err)
  {
    console.error("JSON PARSE HATASI:", err);
    throw new Error("Sunucu geçerli bir JSON döndürmedi: " + text.substring(0, 50));
  }
};

export const registerUser = async (username, email, password) => {
  const response = await fetch('/api/users/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return await response.json();
};

// src/services/api.js

export const startGame = async (mode, difficulty) => {
  const response = await fetch('/api/game/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, difficulty }),
  });

  if (!response.ok) {
    throw new Error('Oyun başlatılamadı');
  }
  return await response.json();
};

// Hamle Yapma (Game.jsx kullanır)
export const makeMove = async (gameId, row, col, value) => {
  const response = await fetch('/api/game/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      gameId, 
      row, 
      col, 
      value 
    }),
  });

  if (!response.ok) {
    throw new Error('Hamle gönderilemedi');
  }
  return await response.json();
};