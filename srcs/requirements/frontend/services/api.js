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