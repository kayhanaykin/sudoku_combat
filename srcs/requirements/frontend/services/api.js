export const loginUser = async (username, password) => {
  try {
    const response = await fetch('/api/users/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const text = await response.text();

    const data = JSON.parse(text);
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    throw err;
  }
};

export const registerUser = async (username, email, password) => {
  const response = await fetch('/api/users/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  return await response.json();
};

export const startGame = async (mode, difficulty) => {
  const response = await fetch('/api/game/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, difficulty }),
  });

  if (!response.ok) {
    throw new Error('The game cannot be started');
  }
  return await response.json();
};

export const makeMove = async (gameId, row, col, value) => {
  const response = await fetch('/api/game/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, row, col, value }),
  });

  if (!response.ok) {
    throw new Error('The move could not be sent');
  }
  return await response.json();
};

export const getLeaderboard = async (mode = 'Total') => {
  try {
    const response = await fetch(`/api/game/api/leaderboard/${mode}`);
    
    if (!response.ok) {
      console.error("Leaderboard fetch failed:", response.status);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error("Leaderboard network error:", error);
    return [];
  }
};

export const recordGameResult = async (userId, mode, isWin) => {
  try {
    await fetch('/api/game/api/record-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  try {
    const response = await fetch(`/api/user/profile/${userId}`); 
    if (!response.ok) return { username: `User ${userId}` };
    const data = await response.json();
    return data;
  } catch (error) {
    return { username: `User ${userId}` };
  }
};

export const createRoom = async (userId, level) => {
  const response = await fetch('/api/room/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, level }),
  });

  if (!response.ok)
    throw new Error('Failed to create room');
  return await response.json();
};

export const joinRoom = async (roomId, userId) => {
  const response = await fetch(`/api/room/join/${roomId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok)
  {
    const err = await response.json();
    throw new Error(err.message || 'Failed to join room');
  }
  return await response.json();
};
